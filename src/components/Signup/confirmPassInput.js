import React, { useEffect } from 'react';
import { TextField, InputAdornment, } from '@mui/material';
import { styled } from '@mui/material/styles';
import { CheckCircle, Cancel } from '@mui/icons-material';

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

const ConfirmPasswordInput = ({ confirmPass, changePassword }) => {
  const { value, error, correct } = confirmPass;

  return (
    <CustomInput
      label="Confirm Password"
      variant="standard"
      value={ value }
      type="password"
      color={ correct ? 'success' : 'primaryColor' }
      sx={{ mt: 2 }}
      onChange={ changePassword }
      error={ error }
      InputProps={{
        endAdornment: <InputAdornment position="end">
        { correct ? <CheckCircleIcon/> : null }
        { error ? <CancelIcon/> : null }
        </InputAdornment>
      }}
    />
  );
};

export default ConfirmPasswordInput;