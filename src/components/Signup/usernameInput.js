import React from 'react';
import { TextField, InputAdornment, CircularProgress } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const CheckCircleIcon = styled(CheckCircle)(({ theme }) => ({
  color: theme.palette.success.main,
}));

const CancelIcon = styled(Cancel)(({ theme }) => ({
  color: theme.palette.error.main,
}));

const CustomInput = styled(TextField)(({ theme }) => ({
  '& label': {
    color: ( theme.palette.mode === 'light' ? 'grey' : '#95a5a6')
  },
  '& .MuiInput-root': {
      '&:hover:before': {
        borderBottom: (theme.palette.mode === 'light' ?
          '1px solid rgba(0,0,0,0.42) !important'
          : '1px solid #fff !important'),
      }
  },
}));

const UsernameInput = ({ name, changeName, checkName }) => {
  const { value, error, correct, loading } = name;
  return (
    <CustomInput
      label="Username"
      variant="standard"
      type="text"
      color={ correct ? 'success' : 'primaryColor'}
      sx={{ mt: 2 }}
      value={value}
      onChange={changeName}
      error={error}
      helperText={ error ? "Username already exists!" : null }
      onBlur={checkName}
      InputProps={{
        endAdornment: <InputAdornment position="end">
          { error ? <CancelIcon/> : null }
          { correct ? <CheckCircleIcon/> : null }
          { loading ? <CircularProgress color="primaryColor" size="1rem" /> : null }
        </InputAdornment>
      }}
    />
  );
};


export default UsernameInput;
