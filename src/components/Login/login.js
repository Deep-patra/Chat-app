import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  Box,
  Stack,
  Button,
  IconButton,
  FormControl,
  Typography,
  CircularProgress,
  } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { VisibilityOff, Visibility, Cancel } from '@mui/icons-material';
import { setUser } from '../../store/actionMethods';

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& label': {
    color: ( theme.palette.mode === 'light' ? 'grey' : '#95a5a6')
  },
  '& .MuiInput-root': {
      '&:hover:before': {
        borderBottom: '1px solid rgba(0,0,0,0.42) !important',
      }
  },
}));

const sumbitData = async (e, values, changeValue, dispatch, navigate) => {
  e.preventDefault();
  const controller = new AbortController();
  const signal = controller.signal;

  try {
    if (values.name !== "" && values.password !== "") {
      const { name, password } = values;
      setTimeout(() => { controller.abort(); }, 10000); // abort the fetch request after 10 seconds 
      const response = await fetch('/login', {
        method: 'POST',
        accept: 'application/json',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username: name, password }),
        signal,
      });
  
      if (response.ok) {
        if (response.status === 200 ) {

          const user = await response.json();
          if (user.username === undefined || user.userId === undefined) throw new Error("username is not defined");

          dispatch(setUser(user));

          // redirect the user to the dashboard
          navigate('/dashboard');
        } else {
          throw new Error('response is not 200'); // throw the error is the response status is not 200
        }
      } else {
        throw new Error('Some error in the server');
      }
    }
  } catch(error) {
    changeValue({ ...values, loading: false, showError: true });
  }

};


const Login = () => {

  const [values, changeValue] = useState({
    name: '',
    password: '',
    showPassword: false,
    loading: false,
    showError: false,
    nameError: false,
    searchingName: false,
    nameFound: false,
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const changePass = (e) => { changeValue({ ...values, password: e.target.value, showError: false }); };
  const handleVisibilityChange = () => changeValue({ ...values, showPassword: !values.showPassword });
  const handleClick = (e) => {
    changeValue({ ...values, loading: true })
    sumbitData(e, values, changeValue, dispatch, navigate);
  };

  return (
    <Box
      display="flex"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
    >
      <form>
        <Box
          width={{
            xs: "250px",
            sm: "400px",
            md: "600px",
          }}
          display="flex"
          flexDirection="column"
          flexWrap="nowrap"
          justifyContent="center"
          padding="10px"
          sx={{
            transition: "height 1s linear",
          }}
        >
          <CustomTextField
            variant="standard"
            label="Username"
            type="text"
            color="primaryColor"
            value={values.name}
            sx={{ mt: 2 }}
            disabled={ values.loading }
            error={ values.showError }
            helperText={ values.showError ? "Username doesn't exist!" : null }
            onChange={(e) => changeValue({ ...values, name: e.target.value, showError: false })}
          />
          <CustomTextField
            variant="standard"
            label="Password"
            color="primaryColor"
            type={values.showPassword ? 'text' : 'password'}
            value={values.password}
            onChange={changePass}
            sx={{ mt: 2, mb: 2 }}
            error={ values.showError }
            disabled={ values.loading }
            helperText={ values.showError ? "Password is incorrect" : null }
            InputProps={{
                endAdornment: <InputAdornment position="end">
                <Stack direction="row" alignItems="center" >
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleVisibilityChange}
                  >
                    { !values.showPassword ? <Visibility /> : <VisibilityOff /> }
                  </IconButton>
                  { values.showError ? <Cancel sx={{ color: 'error.main' }} /> : null }
                </Stack>
              </InputAdornment>
            }}
          />
        <Typography component="p" variant="poster">Don't have an account? 
          <Link to="/signup">Sign Up </Link>
          here.
        </Typography>
        <FormControl>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <Button
              variant="contained"
              sx={{ color:"#FFF" }}
              onClick={handleClick}
              color="primaryColor"
              disabled={ values.name === "" || values.password === "" }
            >
              { values.loading ? <CircularProgress size="1.5rem"/> : 'Login'}
            </Button>
          </Box>
        </FormControl>
        </Box>
      </form>
    </Box>
  );
};

export default Login;