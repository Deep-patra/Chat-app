import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, } from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Cancel, } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const CheckCircleIcon = styled(CheckCircle)(({ theme }) => ({
  color: theme.palette.success.main,
}));

const CancelIcon = styled(Cancel)(({ theme }) => ({
  color: theme.palette.error.main,
}));

const CustomInput = styled(TextField)(({ theme }) => ({
  '& label': {
    color: ( theme.palette.mode === 'light' ? '#7f8c8d' : '#95a5a6')
  },
  '& .MuiInput-root': {
      '&:hover:before': {
        borderBottom: (theme.palette.mode === 'light' ?
        '1px solid rgba(0,0,0,0.42) !important'
        : '1px solid #fff !important'),
      }
  },
}));

const PasswordInput = ({ password, changePassword }) => {
  const [ values, changeValue] = useState({
    click: false,
    focus: false,
    passwordType: true,
  });

  const { value, error, correct } = password;
  const errorText = "Password should contain atleast one capital letter, one small letter, one digit, one symbol " + 
  "and should be atleast 8 characters long";

  const iconClicked = (e) => {
    changeValue({ ...values, passwordType: !values.passwordType, click: !values.click });
  };

  const blurHandler = (e) => {
    changeValue({ ...values, focus: false });
  };

  const focusHandler = () => {
    changeValue({ ...values, focus: true });
  };

  return (
    <CustomInput
      label="Password"
      variant="standard"
      type={ values.passwordType ? 'password' : 'text' }
      sx={{ mt: 2 }}
      value={value}
      color={ correct ? 'success' : 'primaryColor' }
      onChange={changePassword}
      onBlur={blurHandler}
      onFocus={focusHandler}
      error={error}
      helperText={ error ? errorText : null }
      InputProps={{
        endAdornment: <InputAdornment position="end">
          <IconButton onClick={iconClicked}>
            { values.click ? <Visibility sx={{ color: (values.focus ? "primaryColor.main" : "opposite.main")}} />
            : <VisibilityOff sx={{ color: (values.focus ? "primaryColor.main" : "opposite.main")}} /> }
          </IconButton>
          { correct ? <CheckCircleIcon/> : null }
          { error ? <CancelIcon/> : null }
        </InputAdornment>
      }}
    />
  );
};


export default PasswordInput;