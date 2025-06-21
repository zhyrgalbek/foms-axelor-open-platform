import { http } from "@/services/http";

const OPERATOR_ROLES = ["Operator", "SeniorOperator"];

export const initCurrentUserRoles = async (
  currentSession: Record<string, any>,
) => {
  try {
    const currentUserResponse = await http.get(
      `ws/rest/com.axelor.auth.db.User/${currentSession.id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    const userData = await currentUserResponse.json();
    const currentUser = userData.data[0];
    if (!currentUser) return null;

    return {
      id: currentUser.id,
      name: currentUser.name,
      isOperator: isOperator(currentUser, OPERATOR_ROLES),
    };
  } catch (error) {
    console.error("Request failed: ", error);
  }
};

const hasRole = (
  user: Record<string, any> | null,
  roles: string[],
): boolean => {
  if (user?.roles)
    return user.roles.some((role: { name: string }) =>
      roles.includes(role?.name),
    );

  return false;
};

export const isOperator = (
  user: Record<string, any> | null,
  roles: string[] | null,
): boolean => {
  if (!roles) return false;
  return hasRole(user, roles);
};
