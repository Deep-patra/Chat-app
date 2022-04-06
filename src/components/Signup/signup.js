import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
 } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link, useNavigate } from 'react-router-dom';
import { setUser } from '../../store/actionMethods';
import { useDispatch, useSelector } from 'react-redux';
import UsernameInput from './usernameInput';
import PasswordInput from './passwordInput';
import ConfirmPasswordInput from './confirmPassInput';
import StartWorker from '../Socket/socket';

const StyledLink = styled(Link)(({ theme }) => ({
  color: "#3498db",
}));

const passwordRegex = new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$");

const validatePassword = (password) => {
  return passwordRegex.test(password);
}

const submitData = async (values, changeValue, dispatch, navigate) => {
  try {
    const response = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json'},
      accept: 'application/json',
      body: JSON.stringify({ username: values.name.value, password: values.password.value }),
    });

    if( response.ok ) {
      if (response.status === 200) {
        // do something with the response
        const user = await response.json();
        if (user.username === undefined || user.userId === undefined) throw new Error('username or userId is undefined');

        dispatch(setUser(user));

        // navigate to the /dashboard url
        navigate('/dashboard');

      } else {
        throw new Error('response status is not 200');
      }
    } else {
      throw new Error('response is not ok!');
    }
  } catch(error) {
    console.log('error in the signing up :', error);
  }
};

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const usernameExists = useSelector(state => state.usernameExists);
  const [values, changeValue] = useState({
    name: {
      value: '',
      error: false,
      correct: false,
      loading: false,
    },
    password: {
      value: '',
      error: false,
      correct: false,
    },
    confirmPass: {
      value: '',
      error: false,
      correct: false,
    },
    clicked: false,
  });


  // function to change the value of the Username field
  const changeName = (e) => {
    changeValue({ ...values, name: {  value: e.target.value, error: false, correct: false, loading: false } });
  };

  // function to check the name, if it exists
  const checkName = (e) => {
    changeValue({ ...values, name: { ...values.name, loading: true, correct: false, error: false }});
    // check the username through the websockets, if name is not empty string
    if (values.name.value !== "") {
      StartWorker.handleCheckUsername(values.name.value);
    }
  };

  const changePassword = (e) => {
    changeValue({ ...values, password: { value: e.target.value, error: false, correct: false } });
    checkPassword(e);
  };

  const checkPassword = (e) => {
    const value = e.target.value;
    if (value !== "") {
      if (validatePassword(value)) {
        changeValue({ ...values, password: { value, correct: true, error: false } });
      } else {
        changeValue({ ...values, password: { value, error: true, correct: false } });
      }
    } else {
      changeValue({ ...values, password: { value, error: false, correct: false }})
    }
  };

  const changeConfirmPassword = (e) => {
    changeValue({ ...values, confirmPass: { value: e.target.value, error: false, correct: false }})
    checkConfirmPassword(e);
  };

  const checkConfirmPassword = (e) => {
    const value = e.target.value;
    if (value !== "") {
      if (value === values.password.value) {
        changeValue({ ...values, confirmPass: { ...values.confirmPass, error: false, correct: true } });
      } else {
        changeValue({ ...values, confirmPass: { value: e.target.value, error: true, correct: false } });
      }
    } else {
      changeValue({ ...values, confirmPass: {value: e.target.value, error: false, correct: false } });
    }
  };

  const clickHandler = (e) => {
    changeValue({ ...values, clicked: !values.clicked });
    submitData(values, changeValue, dispatch, navigate);
  };


  useEffect(() => {
    if (values.name.value !== '') {
     if (usernameExists)
      changeValue({ ...values, name: { ...values.name, loading: false, correct: true, error: false }});
     else
      changeValue({ ...values, name: { ...values.name, loading: false, correct: false, error: true }});
    }
  }, [usernameExists]);

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
        <UsernameInput name={values.name} changeName={changeName} checkName={checkName} />
        <PasswordInput password={values.password} changePassword={changePassword} />
        <ConfirmPasswordInput
          confirmPass={values.confirmPass}
          changePassword={changeConfirmPassword}
        />
        <Typography variant="poster" sx={{ mt: 2 }}>
          Already had an account? <StyledLink to="/login" >Log in</StyledLink>
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Button
          variant="contained"
          color="primaryColor"
          sx={{ mt: 2, color: '#FFF' }}
          onClick={clickHandler}
          disabled={ values.name.error || values.password.error || values.confirmPass.error 
          || values.name.value === '' || values.password.value === '' || values.confirmPass.value === '' }
          >
            Sign up
          </Button>
        </Box>
        </Box>
      </form>
    </Box>
  );
};


export default Signup;