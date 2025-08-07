import * as React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { countries2 } from "../helpers/countries";
interface CountryType {
  code: string;
  name: string;
  nameRu: string;
  numberCode: string;
  length: number;
}
interface CountrySelectPropsType {
  setImask: (value: any) => void;
}

function CountrySelect({ setImask }: CountrySelectPropsType) {
  const [value, setValue] = React.useState<CountryType | null>(countries2[112]);
  return (
    <Autocomplete
      id="country-select-demo"
      sx={{ width: 180 }}
      options={countries2}
      value={value}
      autoHighlight
      getOptionLabel={(option) => {
        return option.code;
      }}
      renderOption={(props: any, option) => {
        const { key, ...optionProps } = props;
        return (
          <Box key={key} component="li" sx={{ "& > img": { mr: 2, flexShrink: 0 } }} {...optionProps}>
            <img
              loading="lazy"
              width="30"
              srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
              src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
              alt=""
            />
            <Stack>
              <Typography>
                {option.code} {option.numberCode}
              </Typography>
              <Typography fontSize={12} color={grey[500]}>
                {option.nameRu}
              </Typography>
            </Stack>
          </Box>
        );
      }}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            sx={{
              "& > div": {
                padding: "0 !important",
                border: "none !important",
              },
              "& input": {
                paddingLeft: "15px !important",
              },
              fontSize: 14,
            }}
            // label="Choose a country"
            inputProps={{
              ...params.inputProps,
              autoComplete: "new-password", // disable autocomplete and autofill
            }}
          />
        );
      }}
      onChange={(event: any, newValue: CountryType | null) => {
        if (newValue) {
          setImask(newValue);
          setValue(newValue);
        }
      }}
    />
  );
}

CountrySelect.displayName = "CountrySelect";

export default React.memo(CountrySelect);
