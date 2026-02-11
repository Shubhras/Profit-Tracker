# API Workflow Guide - HexaDash React Tailwind

## 📋 Table of Contents
1. [Overview](#overview)
2. [API Architecture](#api-architecture)
3. [DataService Setup](#dataservice-setup)
4. [Authentication Flow](#authentication-flow)
5. [Making API Calls](#making-api-calls)
6. [Complete Examples](#complete-examples)
7. [Redux Integration](#redux-integration)
8. [Error Handling](#error-handling)
9. [Best Practices](#best-practices)
10. [API Endpoint Reference](#api-endpoint-reference)

---

## Overview

This guide explains how API calls work in the HexaDash application and provides step-by-step instructions for making your own API calls.

### Key Components
- **DataService**: Centralized API client (Axios wrapper)
- **Redux Actions**: Async API calls with state management
- **Axios Interceptors**: Automatic token injection
- **Cookie Management**: Token storage and retrieval

---

## API Architecture

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React Component                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. User Action (Button Click, Form Submit, etc.)   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Redux Action Creator                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  2. Dispatch Action (loginBegin, etc.)              │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      DataService                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  3. DataService.post('/user/login/', credentials)   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Axios Interceptor                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  4. Inject Authorization Header from Cookie         │  │
│  │     Authorization: Bearer <token>                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    HTTP Request                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  5. POST http://api.example.com/api/user/login/     │  │
│  │     Headers: { Authorization, Content-Type }        │  │
│  │     Body: { email, password }                       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  6. Process Request                                  │  │
│  │  7. Return Response                                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Response Handling                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  8. Check response.data.status                       │  │
│  │  9. Store tokens in cookies                         │  │
│  │  10. Dispatch success/error action                  │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Redux Reducer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  11. Update state (login: true, loading: false)     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Component Re-render                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  12. UI updates based on new state                  │  │
│  │  13. Navigate to dashboard or show error            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## DataService Setup

### Location
`src/config/dataService/dataService.js`

### Complete Code

```javascript
import axios from 'axios';
import Cookies from 'js-cookie';

// Base API URL from environment variable
const API_ENDPOINT = `${process.env.REACT_APP_API_ENDPOINT}/api`;

// Create Axios instance
const client = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request Interceptor - Automatically adds token to every request
client.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// DataService Class - Wrapper around Axios
class DataService {
  static get(path = '') {
    return client.get(path);
  }

  static post(path = '', data = {}) {
    return client.post(path, data);
  }

  static patch(path = '', data = {}) {
    return client.patch(path, data);
  }

  static put(path = '', data = {}) {
    return client.put(path, data);
  }
  
  static delete(path = '') {
    return client.delete(path);
  }
}

export { DataService };
```

### How It Works

1. **Base URL Configuration**:
   - Reads from `.env` file: `REACT_APP_API_ENDPOINT`
   - Appends `/api` to create full base URL
   - Example: `http://192.168.1.9:8000/api`

2. **Axios Instance**:
   - Pre-configured with base URL
   - Default `Content-Type: application/json`

3. **Request Interceptor**:
   - Runs before every API request
   - Retrieves `access_token` from cookies
   - Automatically adds `Authorization: Bearer <token>` header
   - **You don't need to manually add token to requests!**

4. **DataService Methods**:
   - `get(path)` - GET requests
   - `post(path, data)` - POST requests
   - `patch(path, data)` - PATCH requests
   - `put(path, data)` - PUT requests
   - `delete(path)` - DELETE requests

---

## Authentication Flow

### Login Flow (Complete Example)

#### Step 1: User submits login form

**Component**: `src/container/profile/authentication/overview/SignIn.js`

```javascript
import { useDispatch } from 'react-redux';
import { login } from '../../../../redux/authentication/actionCreator';

function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = (values) => {
    // values = { email: 'user@example.com', password: 'password123' }
    
    dispatch(login(values, (hasSubscription) => {
      // Callback after successful login
      if (hasSubscription) {
        navigate('/admin/profit');
      } else {
        navigate('/admin');
      }
    }));
  };

  return (
    <Form onFinish={handleSubmit}>
      <Form.Item name="email">
        <Input placeholder="Email" />
      </Form.Item>
      <Form.Item name="password">
        <Input.Password placeholder="Password" />
      </Form.Item>
      <Button htmlType="submit">Login</Button>
    </Form>
  );
}
```

#### Step 2: Redux Action Creator

**File**: `src/redux/authentication/actionCreator.js`

```javascript
import { DataService } from '../../config/dataService/dataService';
import Cookies from 'js-cookie';
import actions from './actions';

const login = (values, callback) => {
  return async (dispatch) => {
    // 1. Dispatch loading state
    dispatch(actions.loginBegin());

    try {
      // 2. Make API call
      const response = await DataService.post('/user/login/', values);

      // 3. Check response status
      if (response.data.status === true) {
        // 4. Store tokens in cookies
        Cookies.set('access_token', response.data.data.access);
        Cookies.set('refresh_token', response.data.data.refresh);
        Cookies.set('logedIn', 'true');
        Cookies.set('userEmail', values.email);

        // 5. Store subscription status
        const hasSubscription = response.data.data.has_subscription === true;
        Cookies.set('hasSubscription', hasSubscription ? 'true' : 'false');

        // 6. Dispatch success actions
        dispatch(actions.loginSuccess(true));
        dispatch(actions.setHasSubscription(hasSubscription));

        // 7. Execute callback (navigation)
        callback(hasSubscription);
      }
    } catch (err) {
      // 8. Handle errors
      console.log('Login Failed:', err.response?.data);
      const errorMessage = err.response?.data?.error || 'Something went wrong';
      dispatch(actions.loginErr(errorMessage));
    }
  };
};

export { login };
```

#### Step 3: Redux Reducer

**File**: `src/redux/authentication/reducers.js`

```javascript
const initState = {
  login: Cookies.get('logedIn'),
  hasSubscription: Cookies.get('hasSubscription') === 'true',
  loading: false,
  error: null,
};

const AuthReducer = (state = initState, action) => {
  switch (action.type) {
    case 'LOGIN_BEGIN':
      return {
        ...state,
        loading: true,
        error: null,
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        login: action.data,
        loading: false,
        error: null,
      };
    
    case 'LOGIN_ERR':
      return {
        ...state,
        error: action.err,
        loading: false,
      };
    
    default:
      return state;
  }
};
```

#### Step 4: API Request & Response

**Request**:
```http
POST http://192.168.1.9:8000/api/user/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "status": true,
  "message": "Login successful",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "has_subscription": true,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

---

## Making API Calls

### Method 1: Direct API Call in Component (Simple)

**Use Case**: Simple data fetching without Redux

```javascript
import React, { useEffect, useState } from 'react';
import { DataService } from '../config/dataService/dataService';
import { message } from 'antd';

function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await DataService.get('/user/profile/');
      
      if (response.data.status === true) {
        setData(response.data.data);
      } else {
        message.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('API Error:', error);
      message.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? 'Loading...' : JSON.stringify(data)}
    </div>
  );
}
```

### Method 2: API Call with Redux (Recommended)

**Use Case**: Complex state management, multiple components need the data

#### Step 1: Create Action Creator

**File**: `src/redux/myFeature/actionCreator.js`

```javascript
import { DataService } from '../../config/dataService/dataService';
import actions from './actions';

export const fetchUserData = () => {
  return async (dispatch) => {
    dispatch(actions.fetchBegin());

    try {
      const response = await DataService.get('/user/profile/');
      
      if (response.data.status === true) {
        dispatch(actions.fetchSuccess(response.data.data));
      } else {
        dispatch(actions.fetchError('Failed to fetch'));
      }
    } catch (error) {
      dispatch(actions.fetchError(error.message));
    }
  };
};

export const updateUserData = (userData) => {
  return async (dispatch) => {
    dispatch(actions.updateBegin());

    try {
      const response = await DataService.patch('/user/update-profile/', userData);
      
      if (response.data.status === true) {
        dispatch(actions.updateSuccess(response.data.data));
      } else {
        dispatch(actions.updateError('Update failed'));
      }
    } catch (error) {
      dispatch(actions.updateError(error.message));
    }
  };
};
```

#### Step 2: Use in Component

```javascript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserData, updateUserData } from '../redux/myFeature/actionCreator';

function MyComponent() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.myFeature);

  useEffect(() => {
    dispatch(fetchUserData());
  }, [dispatch]);

  const handleUpdate = (newData) => {
    dispatch(updateUserData(newData));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>{data?.name}</h1>
      <button onClick={() => handleUpdate({ name: 'New Name' })}>
        Update
      </button>
    </div>
  );
}
```

---

## Complete Examples

### Example 1: Fetch User Profile

**Component**: `src/container/profile/settings/overview/Profile.js`

```javascript
import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Spin } from 'antd';
import { DataService } from '../../../../config/dataService/dataService';

function Profile() {
  const [form] = Form.useForm();
  const [fetchLoading, setFetchLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // ✅ Fetch Profile on Component Mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // ✅ GET Request
  const fetchProfile = async () => {
    try {
      setFetchLoading(true);
      const response = await DataService.get('/user/profile/');

      if (response.data.status === true) {
        // Populate form with fetched data
        form.setFieldsValue({
          name: response.data.data.name,
          email: response.data.data.email,
          mobile_number: response.data.data.mobile_number,
          business_name: response.data.data.business_name,
        });
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      message.error('Failed to fetch profile');
    } finally {
      setFetchLoading(false);
    }
  };

  // ✅ PATCH Request
  const handleSubmit = async (values) => {
    try {
      setUpdateLoading(true);
      const response = await DataService.patch('/user/update-profile/', values);

      if (response.data.status === true) {
        message.success('Profile updated successfully!');
      } else {
        message.error('Update failed');
      }
    } catch (error) {
      console.error('Update Error:', error);
      message.error('Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <Spin spinning={fetchLoading}>
      <Form form={form} onFinish={handleSubmit}>
        <Form.Item name="name" label="Name">
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input disabled />
        </Form.Item>
        <Form.Item name="mobile_number" label="Phone">
          <Input />
        </Form.Item>
        <Form.Item name="business_name" label="Business">
          <Input />
        </Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          loading={updateLoading}
        >
          Save Changes
        </Button>
      </Form>
    </Spin>
  );
}

export default Profile;
```

### Example 2: Subscription Management

**Component**: `src/container/profile/settings/overview/Billing.js`

```javascript
import React, { useEffect, useState } from 'react';
import { Button, message, Modal } from 'antd';
import { DataService } from '../../../../config/dataService/dataService';

function Billing() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  // ✅ GET Subscription Details
  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await DataService.get('/my-subscription/');

      if (response.data.status === true) {
        setSubscription(response.data.data);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ POST Cancel Subscription
  const handleCancelSubscription = async () => {
    Modal.confirm({
      title: 'Cancel Subscription?',
      content: 'Are you sure you want to cancel your subscription?',
      onOk: async () => {
        try {
          await DataService.post('/cancel-subscription/');
          message.success('Subscription cancelled');
          fetchSubscription(); // Refresh data
        } catch (error) {
          message.error('Failed to cancel subscription');
        }
      },
    });
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <h2>Current Plan: {subscription?.plan_name}</h2>
          <p>Status: {subscription?.status}</p>
          <Button danger onClick={handleCancelSubscription}>
            Cancel Subscription
          </Button>
        </div>
      )}
    </div>
  );
}

export default Billing;
```

### Example 3: CRUD Operations

**Component**: `src/redux/crud/axios/actionCreator.js`

```javascript
import { DataService } from '../../../config/dataService/dataService';

// ✅ CREATE - POST Request
export const axiosDataSubmit = (data) => {
  return async (dispatch) => {
    try {
      dispatch({ type: 'AXIOS_CREATE_BEGIN' });
      
      const response = await DataService.post('/data/store', data);
      
      if (response.data.status === true) {
        dispatch({ 
          type: 'AXIOS_CREATE_SUCCESS', 
          data: response.data.data 
        });
      }
    } catch (err) {
      dispatch({ type: 'AXIOS_CREATE_ERR', err });
    }
  };
};

// ✅ READ - GET Request
export const axiosDataRead = () => {
  return async (dispatch) => {
    try {
      dispatch({ type: 'AXIOS_READ_BEGIN' });
      
      const response = await DataService.get('/data/all');
      
      if (response.data.status === true) {
        dispatch({ 
          type: 'AXIOS_READ_SUCCESS', 
          data: response.data.data 
        });
      }
    } catch (err) {
      dispatch({ type: 'AXIOS_READ_ERR', err });
    }
  };
};

// ✅ UPDATE - POST/PATCH Request
export const axiosDataUpdate = (id, data) => {
  return async (dispatch) => {
    try {
      dispatch({ type: 'AXIOS_UPDATE_BEGIN' });
      
      const response = await DataService.post(`/data/${id}/update`, data);
      
      if (response.data.status === true) {
        dispatch({ 
          type: 'AXIOS_UPDATE_SUCCESS', 
          data: response.data.data 
        });
      }
    } catch (err) {
      dispatch({ type: 'AXIOS_UPDATE_ERR', err });
    }
  };
};

// ✅ DELETE - POST Request
export const axiosDataDelete = (id) => {
  return async (dispatch) => {
    try {
      dispatch({ type: 'AXIOS_DELETE_BEGIN' });
      
      await DataService.post(`/${id}/delete`, {});
      
      dispatch({ type: 'AXIOS_DELETE_SUCCESS', id });
    } catch (err) {
      dispatch({ type: 'AXIOS_DELETE_ERR', err });
    }
  };
};

// ✅ SEARCH - GET Request with params
export const axiosDataSearch = (searchItem) => {
  return async (dispatch) => {
    try {
      dispatch({ type: 'AXIOS_SEARCH_BEGIN' });
      
      if (searchItem) {
        const response = await DataService.get(`/data/search/${searchItem}`);
        dispatch({ 
          type: 'AXIOS_SEARCH_SUCCESS', 
          data: response.data.data 
        });
      } else {
        // If no search term, fetch all
        const response = await DataService.get('/data/all');
        dispatch({ 
          type: 'AXIOS_SEARCH_SUCCESS', 
          data: response.data.data 
        });
      }
    } catch (err) {
      dispatch({ type: 'AXIOS_SEARCH_ERR', err });
    }
  };
};

// ✅ FILE UPLOAD - POST with FormData
export const axiosFileUpload = (imageAsFile) => {
  return async (dispatch) => {
    try {
      dispatch({ type: 'AXIOS_UPLOAD_BEGIN' });
      
      const data = new FormData();
      data.append('image', imageAsFile);
      
      const response = await DataService.post(
        '/data/image/upload', 
        data, 
        { 'Content-Type': 'multipart/form-data' }
      );
      
      dispatch({ 
        type: 'AXIOS_UPLOAD_SUCCESS', 
        data: response.data.url 
      });
    } catch (err) {
      dispatch({ type: 'AXIOS_UPLOAD_ERR', err });
    }
  };
};
```

---

## Redux Integration

### Complete Redux Flow

#### 1. Actions (Action Types)

**File**: `src/redux/myFeature/actions.js`

```javascript
const actions = {
  FETCH_BEGIN: 'FETCH_BEGIN',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERR: 'FETCH_ERR',

  fetchBegin: () => {
    return {
      type: actions.FETCH_BEGIN,
    };
  },

  fetchSuccess: (data) => {
    return {
      type: actions.FETCH_SUCCESS,
      data,
    };
  },

  fetchErr: (err) => {
    return {
      type: actions.FETCH_ERR,
      err,
    };
  },
};

export default actions;
```

#### 2. Action Creators (Async Logic)

**File**: `src/redux/myFeature/actionCreator.js`

```javascript
import { DataService } from '../../config/dataService/dataService';
import actions from './actions';

export const fetchData = () => {
  return async (dispatch) => {
    dispatch(actions.fetchBegin());

    try {
      const response = await DataService.get('/endpoint');
      
      if (response.data.status === true) {
        dispatch(actions.fetchSuccess(response.data.data));
      } else {
        dispatch(actions.fetchErr('Failed'));
      }
    } catch (error) {
      dispatch(actions.fetchErr(error.message));
    }
  };
};
```

#### 3. Reducers (State Updates)

**File**: `src/redux/myFeature/reducers.js`

```javascript
import actions from './actions';

const initState = {
  data: null,
  loading: false,
  error: null,
};

const myFeatureReducer = (state = initState, action) => {
  const { type, data, err } = action;

  switch (type) {
    case actions.FETCH_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case actions.FETCH_SUCCESS:
      return {
        ...state,
        data,
        loading: false,
        error: null,
      };

    case actions.FETCH_ERR:
      return {
        ...state,
        error: err,
        loading: false,
      };

    default:
      return state;
  }
};

export default myFeatureReducer;
```

#### 4. Combine Reducers

**File**: `src/redux/rootReducers.js`

```javascript
import { combineReducers } from 'redux';
import myFeatureReducer from './myFeature/reducers';
import authReducer from './authentication/reducers';

const rootReducers = combineReducers({
  myFeature: myFeatureReducer,
  auth: authReducer,
  // ... other reducers
});

export default rootReducers;
```

#### 5. Use in Component

```javascript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchData } from '../redux/myFeature/actionCreator';

function MyComponent() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.myFeature);

  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  );
}
```

---

## Error Handling

### Best Practices

```javascript
const fetchData = async () => {
  try {
    setLoading(true);
    const response = await DataService.get('/endpoint');

    // ✅ Check API response status
    if (response.data.status === true) {
      setData(response.data.data);
      message.success('Data loaded successfully');
    } else {
      // ❌ API returned error
      const errorMsg = response.data.message || 'Failed to load data';
      message.error(errorMsg);
    }
  } catch (error) {
    // ❌ Network error or server error
    console.error('API Error:', error);
    
    // Check if error has response (server responded with error)
    if (error.response) {
      const errorMsg = error.response.data?.message || 'Server error';
      message.error(errorMsg);
    } else if (error.request) {
      // Request was made but no response
      message.error('No response from server');
    } else {
      // Something else happened
      message.error('Request failed');
    }
  } finally {
    setLoading(false);
  }
};
```

### Common Error Scenarios

```javascript
// 1. ✅ 401 Unauthorized - Token expired
catch (error) {
  if (error.response?.status === 401) {
    message.error('Session expired. Please login again.');
    Cookies.remove('access_token');
    navigate('/auth/login');
  }
}

// 2. ✅ 403 Forbidden - No permission
catch (error) {
  if (error.response?.status === 403) {
    message.error('You do not have permission to perform this action');
  }
}

// 3. ✅ 404 Not Found
catch (error) {
  if (error.response?.status === 404) {
    message.error('Resource not found');
  }
}

// 4. ✅ 500 Server Error
catch (error) {
  if (error.response?.status === 500) {
    message.error('Server error. Please try again later.');
  }
}

// 5. ✅ Network Error
catch (error) {
  if (!error.response) {
    message.error('Network error. Please check your connection.');
  }
}
```

---

## Best Practices

### 1. Always Use Try-Catch

```javascript
// ✅ Good
const fetchData = async () => {
  try {
    const response = await DataService.get('/endpoint');
    // Handle response
  } catch (error) {
    // Handle error
  }
};

// ❌ Bad
const fetchData = async () => {
  const response = await DataService.get('/endpoint');
  // No error handling
};
```

### 2. Use Loading States

```javascript
// ✅ Good
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  setLoading(true);
  try {
    const response = await DataService.get('/endpoint');
    setData(response.data.data);
  } finally {
    setLoading(false); // Always reset loading
  }
};

return loading ? <Spin /> : <DataDisplay data={data} />;
```

### 3. Check Response Status

```javascript
// ✅ Good
const response = await DataService.get('/endpoint');

if (response.data.status === true) {
  // Success
  setData(response.data.data);
} else {
  // API returned error
  message.error(response.data.message);
}

// ❌ Bad
const response = await DataService.get('/endpoint');
setData(response.data.data); // Might be undefined if status is false
```

### 4. Use Meaningful Variable Names

```javascript
// ✅ Good
const fetchUserProfile = async () => {
  const response = await DataService.get('/user/profile/');
  const userProfile = response.data.data;
  setProfile(userProfile);
};

// ❌ Bad
const fetch = async () => {
  const res = await DataService.get('/user/profile/');
  const d = res.data.data;
  setProfile(d);
};
```

### 5. Avoid Duplicate API Calls

```javascript
// ✅ Good - Check if already loading
const fetchData = async () => {
  if (loading) return; // Prevent duplicate calls
  
  setLoading(true);
  try {
    const response = await DataService.get('/endpoint');
    setData(response.data.data);
  } finally {
    setLoading(false);
  }
};

// ✅ Good - Use useEffect dependency array
useEffect(() => {
  fetchData();
}, []); // Empty array = run once on mount
```

### 6. Clean Up on Unmount

```javascript
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    try {
      const response = await DataService.get('/endpoint');
      if (isMounted) {
        setData(response.data.data);
      }
    } catch (error) {
      if (isMounted) {
        setError(error.message);
      }
    }
  };

  fetchData();

  return () => {
    isMounted = false; // Cleanup
  };
}, []);
```

---

## API Endpoint Reference

### Authentication Endpoints

```javascript
// Login
POST /api/user/login/
Body: { email, password }
Response: { status, message, data: { access, refresh, has_subscription } }

// Register
POST /api/user/register/
Body: { email, password, name }
Response: { status, message }

// Forgot Password
POST /api/user/forgot-password/
Body: { email }
Response: { status, message }

// Reset Password
POST /api/user/reset-password/
Body: { email, otp, new_password }
Response: { status, message }

// Change Password
POST /api/user/change-password/
Body: { old_password, new_password }
Response: { status, message }

// Get Profile
GET /api/user/profile/
Response: { status, data: { name, email, mobile_number, ... } }

// Update Profile
PATCH /api/user/update-profile/
Body: { name, mobile_number, business_name, ... }
Response: { status, message, data }
```

### Subscription Endpoints

```javascript
// Get Subscription Plans
GET /api/subscription-plans/
Response: { status, data: [{ id, name, price, features }] }

// Create Subscription
POST /api/create-subscription/
Body: { plan_id }
Response: { status, data: { order_id, amount } }

// Verify Payment
POST /api/verify-payment/
Body: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
Response: { status, message }

// Get My Subscription
GET /api/my-subscription/
Response: { status, data: { plan_name, status, expires_at } }

// Cancel Subscription
POST /api/cancel-subscription/
Response: { status, message }
```

### CRUD Endpoints

```javascript
// Get All Data
GET /api/data/all
Response: { status, data: [...] }

// Create Data
POST /api/data/store
Body: { field1, field2, ... }
Response: { status, data }

// Get Single Data
GET /api/data/:id/show
Response: { status, data }

// Update Data
POST /api/data/:id/update
Body: { field1, field2, ... }
Response: { status, data }

// Delete Data
POST /api/:id/delete
Response: { status, message }

// Search Data
GET /api/data/search/:searchTerm
Response: { status, data: [...] }

// Upload Image
POST /api/data/image/upload
Body: FormData with 'image' field
Response: { status, url }
```

---

## Quick Reference: How to Make Your Own API Call

### Step-by-Step Template

```javascript
// 1. Import DataService
import { DataService } from '../config/dataService/dataService';
import { message } from 'antd';

// 2. Create async function
const myApiCall = async () => {
  try {
    // 3. Set loading state
    setLoading(true);

    // 4. Make API call
    const response = await DataService.get('/your-endpoint');
    // or
    // const response = await DataService.post('/your-endpoint', { data });

    // 5. Check response status
    if (response.data.status === true) {
      // 6. Handle success
      setData(response.data.data);
      message.success('Success!');
    } else {
      // 7. Handle API error
      message.error(response.data.message || 'Failed');
    }
  } catch (error) {
    // 8. Handle network/server error
    console.error('API Error:', error);
    message.error('Something went wrong');
  } finally {
    // 9. Reset loading state
    setLoading(false);
  }
};

// 10. Call function
useEffect(() => {
  myApiCall();
}, []);
```

### Copy-Paste Template

```javascript
import React, { useState, useEffect } from 'react';
import { DataService } from '../config/dataService/dataService';
import { message, Spin } from 'antd';

function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await DataService.get('/your-endpoint');

      if (response.data.status === true) {
        setData(response.data.data);
      } else {
        message.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const updateData = async (newData) => {
    try {
      setLoading(true);
      const response = await DataService.post('/your-endpoint', newData);

      if (response.data.status === true) {
        message.success('Updated successfully');
        fetchData(); // Refresh data
      } else {
        message.error('Update failed');
      }
    } catch (error) {
      console.error('Error:', error);
      message.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin />;

  return (
    <div>
      {/* Your UI here */}
      {JSON.stringify(data)}
    </div>
  );
}

export default MyComponent;
```

---

## Summary

### Key Takeaways

1. **DataService** is your API client - use it for all API calls
2. **Token is automatic** - no need to manually add Authorization header
3. **Always use try-catch** for error handling
4. **Check response.data.status** before using data
5. **Use loading states** for better UX
6. **Redux for global state**, local state for component-specific data

### Common Patterns

```javascript
// GET Request
const response = await DataService.get('/endpoint');

// POST Request
const response = await DataService.post('/endpoint', { data });

// PATCH Request
const response = await DataService.patch('/endpoint', { data });

// PUT Request
const response = await DataService.put('/endpoint', { data });

// DELETE Request
const response = await DataService.delete('/endpoint');
```

### Response Structure

All API responses follow this format:

```json
{
  "status": true,
  "message": "Success message",
  "data": {
    // Your data here
  }
}
```

---

**Last Updated**: February 9, 2026  
**Version**: 1.0  
**Maintained by**: Development Team
