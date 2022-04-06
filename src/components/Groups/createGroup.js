import React, { useState, useEffect } from 'react';
import { 
  IconButton, 
  Popover,
  Tooltip,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { addGroup } from '../../store/actionMethods';

const createGroup = async (groupName, userId) => {
  const response = await fetch(`/${userId}/createGroup`, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    accept: 'application/json',
    body: JSON.stringify({ groupName }),
  });
  if (!response.ok) throw new Error("response is not error!");
  if (response.status !== 200) throw new Error('response is not ok');

  const res = await response.json();
  if (res.group === undefined) throw new Error('group is undefined');
  return res.group;
};



const PopoverItem = ({ handleSubmit, error, changeError }) => {
  const [ value, changeValue ] = useState('');
  const userId = useSelector(state => state.userId);
  const handleChange = (e) => {
    changeValue(e.target.value);
  };

  const handleCreate = (e) => {
    changeValue('');
    handleSubmit(value, userId);
  };

  useEffect(() => {
    return () => {
      changeError();
    }
  }, []);

  return (
    <Box display="flex" flexDirection="column">
      <Typography
        component="p"
        fontSize="15px"
        pl="10px"
        sx={{
          color: "primaryColor.main"
        }}
      >
        Create a new Group:
      </Typography>
      <Box
      display="flex"
      flexDirection="row"
      p="8px"
      pt="12px"
    >
      <TextField
        label="Group name"
        color="primaryColor"
        variant="outlined"
        value={value}
        type="text"
        error={error}
        onChange={handleChange}
        helperText={ error ? " An Error occurred !" : null }
      />
      <Button variant="text" color="primaryColor" onClick={handleCreate} disabled={value === "" ? true : false}>
        Create
      </Button>
    </Box>
    </Box>
  );
};


const CreateGroup = () => {
  const [ anchorEl, changeAnchorEl ] = useState(null);
  const [ error, changeError ] = useState(false);
  const dispatch = useDispatch();

  const handleClick = (e) => {
    changeAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    changeAnchorEl(null);
  };

  const handleSubmit = async (groupName, userId) => {
    try {
      const group = await createGroup(groupName, userId);
      if (group === undefined) throw new Error('received group is undefined!');
      dispatch(addGroup(group));
      changeAnchorEl(null);
    } catch (error) {
      // do something
      changeError(true);
    }
  };

  const handleChangeError = () => {
    changeError(false);
  };

  useEffect(() => {
    return () => {
      changeError(false);
    }
  }, []);
  
  return (
    <>
      <Tooltip title="Create a new group">
        <IconButton onClick={handleClick}>
          <Add sx={{ color: "primaryColor.main" }} />
        </IconButton>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <PopoverItem handleSubmit={handleSubmit} error={error} changeError={handleChangeError} />
      </Popover>
    </>
  );
};

export default CreateGroup;