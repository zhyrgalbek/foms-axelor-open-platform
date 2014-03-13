/**
 * Axelor Business Solutions
 *
 * Copyright (C) 2012-2014 Axelor (<http://axelor.com>).
 *
 * This program is free software: you can redistribute it and/or  modify
 * it under the terms of the GNU Affero General Public License, version 3,
 * as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
package com.axelor.rpc;

import java.io.IOException;
import java.io.Writer;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.inject.Inject;
import javax.inject.Provider;
import javax.persistence.EntityTransaction;
import javax.persistence.OptimisticLockException;

import org.hibernate.StaleObjectStateException;
import org.hibernate.proxy.HibernateProxy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.axelor.db.JPA;
import com.axelor.db.JpaSecurity;
import com.axelor.db.Model;
import com.axelor.db.Query;
import com.axelor.db.QueryBinder;
import com.axelor.db.mapper.Mapper;
import com.axelor.db.mapper.Property;
import com.axelor.db.mapper.PropertyType;
import com.axelor.rpc.filter.Filter;
import com.google.common.base.CaseFormat;
import com.google.common.base.Function;
import com.google.common.base.Joiner;
import com.google.common.base.Objects;
import com.google.common.base.Splitter;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.primitives.Longs;
import com.google.inject.Injector;
import com.google.inject.TypeLiteral;
import com.google.inject.persist.Transactional;

/**
 * This class defines CRUD like interface.
 *
 */
public class Resource<T extends Model> {

	private Class<T> model;

	private Provider<JpaSecurity> security;

    private Logger LOG = LoggerFactory.getLogger(Resource.class);

	private Resource(Class<T> model, Provider<JpaSecurity> security) {
		this.model = model;
		this.security = security;
	}

	@Inject
	@SuppressWarnings("unchecked")
	public Resource(TypeLiteral<T> typeLiteral, Provider<JpaSecurity> security) {
		this((Class<T>) typeLiteral.getRawType(), security);
	}

	/**
	 * Returns the resource class.
	 *
	 */
	public Class<?> getModel() {
		return model;
	}

	private Long findId(Map<String, Object> values) {
		try {
			return Long.parseLong(values.get("id").toString());
		} catch (Exception e){}
		return null;
	}

	public Response fields() {

		Response response = new Response();
		Map<String, Object> meta = Maps.newHashMap();

		List<Object> fields = Lists.newArrayList();
		for (Property p : JPA.fields(model)) {
			fields.add(p.toMap());
		}

		meta.put("model", model.getName());
		//TODO: meta.put("title", "");
		//TODO: meta.put("description", "");
		//TODO: meta.put("defaults", null);
		meta.put("fields", fields);

		response.setData(meta);
		response.setStatus(Response.STATUS_SUCCESS);

		return response;
	}

	public static Response models(Request request) {

		Response response = new Response();

		List<String> data = Lists.newArrayList();
		for(Class<?> type : JPA.models()) {
			data.add(type.getName());
		}

		Collections.sort(data);

		response.setData(ImmutableList.copyOf(data));
		response.setStatus(Response.STATUS_SUCCESS);

		return response;
	}

	public Response perms() {
		Set<JpaSecurity.AccessType> perms = security.get().getAccessTypes(model, null);
		Response response = new Response();

		response.setData(perms);
		response.setStatus(Response.STATUS_SUCCESS);

		return response;
	}

	public Response perms(Long id) {
		Set<JpaSecurity.AccessType> perms = security.get().getAccessTypes(model, id);
		Response response = new Response();

		response.setData(perms);
		response.setStatus(Response.STATUS_SUCCESS);

		return response;
	}

	public Response perms(Long id, String perm) {
		Response response = new Response();

		JpaSecurity sec = security.get();
		JpaSecurity.AccessType type = JpaSecurity.CAN_READ;
		try {
			type = JpaSecurity.AccessType.valueOf(perm.toUpperCase());
		} catch (Exception e) {
		}

		try {
			sec.check(type, model, id);
			response.setStatus(Response.STATUS_SUCCESS);
		} catch (Exception e) {
			response.addError(perm, e.getMessage());
			response.setStatus(Response.STATUS_VALIDATION_ERROR);
		}
		return response;
	}

	private List<String> getSortBy(Request request) {

		List<String> sortBy = Lists.newArrayList();
		Mapper mapper = Mapper.of(model);

		if (request.getSortBy() != null) {
			for(String spec : request.getSortBy()) {
				String name = spec;
				if (name.startsWith("-")) {
					name = name.substring(1);
				}
				Property property = mapper.getProperty(name);
				if (property != null && property.isReference()) {
					// use name field to sort many-to-one column
					Mapper m = Mapper.of(property.getTarget());
					Property p = m.getNameField();
					if (p != null) {
						spec = spec + "." + p.getName();
					}
				}
				sortBy.add(spec);
			}
		}

		if (sortBy.size() > 0) {
			return sortBy;
		}

		if (mapper.getNameField() != null) {
			sortBy.add(mapper.getNameField().getName());
			return sortBy;
		}

		if (mapper.getProperty("code") != null) {
			sortBy.add("code");
			return sortBy;
		}

		return sortBy;
	}

	private Criteria getCriteria(Request request) {
		if (request.getData() != null) {
			Object domain = request.getData().get("_domain");
			if (domain != null) {
				try {
					JPA.em().createQuery(
							"SELECT self FROM " + model.getSimpleName() +
							" self WHERE " + domain);
				} catch (Exception e) {
					throw new IllegalArgumentException("Invalid domain: " + domain);
				}
			}
		}
		return request.getCriteria();
	}

	private Query<?> getQuery(Request request) {
		Criteria criteria = getCriteria(request);
		Filter filter = security.get().getFilter(JpaSecurity.CAN_READ, model);
		Query<?> query = JPA.all(model);

		if (criteria != null) {
			query = criteria.createQuery(model, filter);
		} else if (filter != null) {
			query = filter.build(model);
		}

		for(String sortBy : getSortBy(request)) {
			query = query.order(sortBy);
		}

		return query;
	}

	public Response search(Request request) {

		security.get().check(JpaSecurity.CAN_READ, model);

		LOG.debug("Searching '{}' with {}", model.getCanonicalName(), request.getData());

		Response response = new Response();

		int offset = request.getOffset();
		int limit = request.getLimit();

		Query<?> query = getQuery(request);
		List<?> data = null;
		try {
			if (request.getFields() != null) {
				Query<?>.Selector selector = query.cacheable().select(request.getFields().toArray(new String[]{}));
				LOG.debug("JPQL: {}", selector);
				data = selector.fetch(limit, offset);
			} else {
				LOG.debug("JPQL: {}", query);
				data = query.cacheable().fetch(limit, offset);
			}
			response.setTotal(query.count());
		} catch (Exception e) {
			EntityTransaction txn = JPA.em().getTransaction();
			if (txn.isActive()) {
				txn.rollback();
			}
			data = Lists.newArrayList();
			LOG.error("Error: {}", e, e);
		}

		LOG.debug("Records found: {}", data.size());

		data = Lists.transform(data, new Function<Object, Object>() {
			@Override
			public Object apply(Object input) {
				if (input instanceof Model) {
					return toMapCompact((Model) input);
				}
				return input;
			};
		});

		response.setData(data);
		response.setOffset(offset);
		response.setStatus(Response.STATUS_SUCCESS);

		return response;
	}

	@SuppressWarnings("unchecked")
	public void export(Request request, Writer writer) throws IOException {
		security.get().check(JpaSecurity.CAN_READ, model);
		LOG.debug("Exporting '{}' with {}", model.getName(), request.getData());

		List<String> fields = request.getFields();
		List<String> header = Lists.newArrayList();
		List<String> names = Lists.newArrayList();
		Map<Integer, Map<String, String>> selection = Maps.newHashMap();

		Mapper mapper = Mapper.of(model);

		for(String field : fields) {
			Iterator<String> iter = Splitter.on(".").split(field).iterator();
			Property prop = mapper.getProperty(iter.next());
			while(iter.hasNext() && prop != null) {
				prop = Mapper.of(prop.getTarget()).getProperty(iter.next());
			}
			if (prop == null || prop.isCollection()) {
				continue;
			}

			String name = prop.getName();
			String title = prop.getTitle();
			if(iter != null) {
				name = field;
			}

			if (title == null) {
				title = CaseFormat.LOWER_CAMEL.to(CaseFormat.LOWER_UNDERSCORE, prop.getName());
				title = humanize(title);
			}

			if (prop.isReference()) {
				prop = Mapper.of(prop.getTarget()).getNameField();
				if (prop == null) {
					continue;
				}
				name = name + '.' + prop.getName();
			}
			else if(prop.getSelection() != null && !"".equals(prop.getSelection().trim())) {
				javax.persistence.Query q = JPA.em().createQuery("SELECT new List(self.value, self.title) FROM MetaSelectItem self "
						+ "JOIN self.select metaSelect "
						+ "WHERE metaSelect.name = ?1");
				q.setParameter(1, prop.getSelection());

				List<List<?>> result = q.getResultList();
				if (result == null || result.isEmpty()) {
					continue;
				}

				Map<String, String> map = Maps.newHashMap();
				for (List<?> object : result) {
					map.put(object.get(0).toString(), object.get(1).toString());
				}
				selection.put(header.size(), map);
			}

			title = JPA.translate(title, title, prop.getEntity().getName());

			names.add(name);
			header.add(escapeCsv(title));
		}

		writer.write(Joiner.on(";").join(header));

		int limit = 100;
		int offset = 0;

		Query<?> query = getQuery(request);
		Query<?>.Selector selector = query.select(names.toArray(new String[0]));

		List<?> data = selector.values(limit, offset);

		while(!data.isEmpty()) {

			for(Object item : data) {
				List<?> row = (List<?>) item;
				List<String> line = Lists.newArrayList();
				int index = 0;
				for(Object value: row) {
					if (index++ < 2) continue; // ignore first two items (id, version)
					Object objValue = value == null ? "" : value;
					if(selection.containsKey(index-3)) {
						objValue = selection.get(index-3).get(objValue.toString());
					}
					String strValue = objValue == null ? "" : escapeCsv(objValue.toString());
					line.add(strValue);
				}
				writer.write("\n");
				writer.write(Joiner.on(";").join(line));
			}

			offset += limit;
			data = selector.values(limit, offset);
		}
	}

	private String escapeCsv(String value) {
		if (value == null) return "";
		if (value.indexOf('"') > -1) value = value.replaceAll("\"", "\"\"");
		return '"' + value + '"';
	}

	private String humanize(String value) {
		if (value.endsWith("_id")) value = value.substring(0, value.length() - 3);
		if (value.endsWith("_set")) value = value.substring(0, value.length() - 5);
		if (value.endsWith("_list")) value = value.substring(0, value.length() - 6);
		return value.substring(0, 1).toUpperCase() +
			   value.substring(1).replaceAll("_+", " ");
	}

	public Response read(long id) {
		security.get().check(JpaSecurity.CAN_READ, model, id);
		Response response = new Response();
		List<Object> data = Lists.newArrayList();

		Model entity = JPA.find(model, id);
		if (entity != null)
			data.add(entity);
		response.setData(data);
		response.setStatus(Response.STATUS_SUCCESS);

		return response;
	}

	public Response fetch(long id, Request request) {
		security.get().check(JpaSecurity.CAN_READ, model, id);
		Response response = new Response();
		List<Object> data = Lists.newArrayList();

		Model entity = JPA.find(model, id);
		if (entity != null) {
			data.add(toMap(entity, request.getFields().toArray(new String[]{})));
		}
		response.setData(data);
		response.setStatus(Response.STATUS_SUCCESS);

		return response;
	}

	public Response verify(Request request) {
		Response response = new Response();
		try {
			JPA.verify(model, request.getData());
			response.setStatus(Response.STATUS_SUCCESS);
		} catch (OptimisticLockException e) {
			response.setStatus(Response.STATUS_VALIDATION_ERROR);
		}
		return response;
	}

	@Transactional
	public Response save(final Request request) {

		Response response = new Response();

		List<Object> records = request.getRecords();
		List<Object> data = Lists.newArrayList();

		if (records == null) {
			records = Lists.newArrayList();
			records.add(request.getData());
		}

		for(Object record : records) {

			@SuppressWarnings("all")
			Long id = findId((Map) record);

			if (id == null || id <= 0L) {
				security.get().check(JpaSecurity.CAN_CREATE, model);
			}

			@SuppressWarnings("all")
			Map<String, Object> orig = (Map) ((Map) record).get("_original");
			JPA.verify(model, orig);

			@SuppressWarnings("all")
			Model bean = JPA.edit(model, (Map) record);
			id = bean.getId();

			if (bean != null && id != null && id > 0L) {
				security.get().check(JpaSecurity.CAN_WRITE, model, id);
			}

			bean = JPA.manage(bean);
			data.add(bean);
		}

		response.setData(data);
		response.setStatus(Response.STATUS_SUCCESS);

		return response;
	}

	@Transactional
	public Response updateMass(Request request) {

		security.get().check(JpaSecurity.CAN_WRITE, model);

		LOG.debug("Mass update '{}' with {}", model.getCanonicalName(), request.getData());

		Response response = new Response();

		Query<?> query = getQuery(request);
		List<?> data = request.getRecords();

		LOG.debug("JPQL: {}", query);

		@SuppressWarnings("all")
		Map<String, Object> values = (Map) data.get(0);
		response.setTotal(query.update(values));

		LOG.debug("Records updated: {}", response.getTotal());

		response.setStatus(Response.STATUS_SUCCESS);

		return response;
	}

	@Transactional
	public Response remove(long id, Request request) {

		security.get().check(JpaSecurity.CAN_REMOVE, model, id);
		final Response response = new Response();
		final Map<String, Object> data = Maps.newHashMap();

		data.put("id", id);
		data.put("version", request.getData().get("version"));

		Model bean = JPA.edit(model, data);
		if (bean.getId() != null) {
			JPA.remove(bean);
		}

		response.setData(ImmutableList.of(toMapCompact(bean)));
		response.setStatus(Response.STATUS_SUCCESS);

		return response;
	}

	@Transactional
	@SuppressWarnings("all")
	public Response remove(Request request) {

		final Response response = new Response();
		final List<Object> records = request.getRecords();

		if (records == null || records.isEmpty()) {
			response.setException(new IllegalArgumentException("No records provides."));
			return response;
		}

		final List<Model> entities = Lists.newArrayList();

		for(Object record : records) {
			Map map = (Map) record;
			Long id = Longs.tryParse(map.get("id").toString());
			Object version = map.get("version");

			security.get().check(JpaSecurity.CAN_REMOVE, model, id);
			Model bean = JPA.find(model, id);

			if (version != null && !Objects.equal(version, bean.getVersion())) {
				throw new OptimisticLockException(
						new StaleObjectStateException(model.getName(), id));
			}
			entities.add(bean);
		}

		for(Model entity : entities) {
			if (JPA.em().contains(entity)) {
				JPA.remove(entity);
			}
		}

		response.setData(records);
		response.setStatus(Response.STATUS_SUCCESS);

		return response;
	}

	public Response copy(long id) {
		security.get().check(JpaSecurity.CAN_CREATE, model, id);
		Response response = new Response();
		Model bean = JPA.find(model, id);

		bean = JPA.copy(bean, true);
		response.setData(ImmutableList.of(bean));
		response.setStatus(Response.STATUS_SUCCESS);

		return response;
	}

	@Inject
	private Injector injector;

	public ActionResponse action(ActionRequest request) {

		ActionResponse response = new ActionResponse();
		String[] parts = request.getAction().split("\\:");

		if (parts.length != 2) {
			response.setStatus(Response.STATUS_FAILURE);
			return response;
		}

		String controller = parts[0];
		String method = parts[1];

		try {
			Class<?> klass = Class.forName(controller);
			Method m = klass.getDeclaredMethod(method, ActionRequest.class, ActionResponse.class);
			Object obj = injector.getInstance(klass);

			m.setAccessible(true);
			m.invoke(obj, new Object[] { request, response });

			response.setStatus(Response.STATUS_SUCCESS);
		} catch (Exception e) {
			LOG.debug(e.toString(), e);
			response.setException(e);
		}
		return response;
	}

	/**
	 * Get the name of the record. This method should be used to get the value
	 * of name field if it's a function field.
	 *
	 * @param request
	 *            the request containing the current values of the record
	 * @return response with the updated values with record name
	 */
	public Response getRecordName(Request request) {

		Response response = new Response();

		Mapper mapper = Mapper.of(model);
		Map<String, Object> data = request.getData();

		Property property = mapper.getNameField();
		if (property != null) {
			String qs = String.format(
					"SELECT self.%s FROM %s self WHERE self.id = :id",
					property.getName(), model.getSimpleName());

			javax.persistence.Query query = JPA.em().createQuery(qs);
			QueryBinder.of(query).bind(data);

			Object name = query.getSingleResult();
			data.put(property.getName(), name);
		}

		response.setData(ImmutableList.of(data));
		response.setStatus(Response.STATUS_SUCCESS);

		return response;
	}

	public static Map<String, Object> toMap(Object bean, String... names) {
		return _toMap(bean, unflatten(null, names), false, 0);
	}

	public static Map<String, Object> toMapCompact(Object bean) {
		return _toMap(bean, null, true, 1);
	}

	@SuppressWarnings("all")
	private static Map<String, Object> _toMap(Object bean, Map<String, Object> fields, boolean compact, int level) {

		if (bean == null) {
			return null;
		}

		if (bean instanceof HibernateProxy) {
			bean = ((HibernateProxy) bean).getHibernateLazyInitializer().getImplementation();
		}

		if (fields == null) {
			fields = Maps.newHashMap();
		}

		Map<String, Object> result = new HashMap<String, Object>();
		Mapper mapper = Mapper.of(bean.getClass());

		boolean isSaved = ((Model)bean).getId() != null;
		boolean isCompact = compact || fields.containsKey("$version");

		if ((isCompact && isSaved) || (isSaved && level >= 1 ) || (level > 1)) {

			Property pn = mapper.getNameField();
			Property pc = mapper.getProperty("code");

			result.put("id", mapper.get(bean, "id"));
			result.put("$version", mapper.get(bean, "version"));

			if (pn != null)
				result.put(pn.getName(), mapper.get(bean, pn.getName()));
			if (pc != null)
				result.put(pc.getName(), mapper.get(bean, pc.getName()));

			for(String name: fields.keySet()) {
				Object child = mapper.get(bean, name);
				if (child instanceof Model) {
					child = _toMap(child, (Map) fields.get(name), true, level + 1);
				}
				if (child != null) {
					result.put(name, child);
				}
			}
			return result;
		}

		for (final Property prop : mapper.getProperties()) {

			String name = prop.getName();
			PropertyType type = prop.getType();

			if (type == PropertyType.BINARY) {
				continue;
			}

			if (isSaved && prop.isCollection() && !fields.isEmpty() && !fields.containsKey(name)) {
				continue;
			}

			Object value = mapper.get(bean, name);

			if (prop.isImage() && byte[].class.isInstance(value)) {
				value = new String((byte[]) value);
			}

			// decimal values should be rounded accordingly otherwise the
			// json mapper may use wrong scale.
			if (value instanceof BigDecimal) {
				BigDecimal decimal = (BigDecimal) value;
				int scale = prop.getScale();
				if (decimal.scale() == 0 && scale > 0 && scale != decimal.scale()) {
					value = decimal.setScale(scale, RoundingMode.HALF_UP);
				}
			}

			if (value instanceof Model) { // m2o
				Map<String, Object> _fields = (Map) fields.get(prop.getName());
				value = _toMap(value, _fields, true, level + 1);
			}

			if (value instanceof Collection) { // o2m | m2m
				List<Object> items = Lists.newArrayList();
				for(Model input : (Collection<Model>) value) {
					Map<String, Object> item;
					if (input.getId() != null) {
						item = _toMap(input, null, true, level+1);
					} else {
						item = _toMap(input, null, false, 1);
					}
					if (item != null) {
						items.add(item);
					}
				}
				value = items;
			}
			result.put(name, value);
		}

		return result;
	}

	@SuppressWarnings("all")
	private static Map<String, Object> unflatten(Map<String, Object> map, String... names) {
		if (map == null) map = Maps.newHashMap();
		for(String name : names) {
			if (map.containsKey(name))
				continue;
			if (name.contains(".")) {
				String[] parts = name.split("\\.", 2);
				Map<String, Object> child = (Map) map.get(parts[0]);
				if (child == null) {
					child = Maps.newHashMap();
				}
				map.put(parts[0], unflatten(child, parts[1]));
			} else {
				map.put(name, Maps.newHashMap());
			}
		}
		return map;
	}
}
