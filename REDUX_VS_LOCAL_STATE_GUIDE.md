# Redux vs Local State - Complete Decision Guide

## 📋 Table of Contents
1. [Quick Decision Tree](#quick-decision-tree)
2. [When to Use Redux](#when-to-use-redux)
3. [When to Use Local State](#when-to-use-local-state)
4. [Decision Criteria](#decision-criteria)
5. [Real-World Examples](#real-world-examples)
6. [Anti-Patterns to Avoid](#anti-patterns-to-avoid)
7. [Migration Guide](#migration-guide)
8. [Best Practices](#best-practices)
9. [Performance Considerations](#performance-considerations)
10. [Code Templates](#code-templates)

---

## Quick Decision Tree

```
┌─────────────────────────────────────────────────────────────┐
│           Do you need to make an API call?                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │  Is this data needed by multiple   │
        │  components across the app?        │
        └────────┬───────────────────┬───────┘
                 │                   │
            YES  │                   │  NO
                 ▼                   ▼
        ┌─────────────────┐  ┌──────────────────┐
        │  USE REDUX      │  │  Does the data   │
        │                 │  │  persist across  │
        │  Examples:      │  │  route changes?  │
        │  - Auth state   │  └────┬─────────┬───┘
        │  - User profile │       │         │
        │  - Cart items   │  YES  │         │  NO
        │  - Notifications│       ▼         ▼
        └─────────────────┘  ┌─────────┐  ┌──────────────┐
                             │ REDUX   │  │ LOCAL STATE  │
                             │         │  │              │
                             │ Or use  │  │ Examples:    │
                             │ Context │  │ - Form data  │
                             │ API     │  │ - Modal open │
                             └─────────┘  │ - Search     │
                                          └──────────────┘
```

---

## When to Use Redux

### ✅ Use Redux When:

#### 1. **Global Application State**
Data that needs to be accessed by multiple components across different parts of the application.

**Examples:**
- User authentication status
- User profile information
- Shopping cart items
- Application theme (dark/light mode)
- Language/locale settings
- Notifications/alerts

**Why Redux?**
- Single source of truth
- Prevents prop drilling
- Easy to debug with Redux DevTools
- Predictable state updates

#### 2. **Data Shared Across Routes**
Data that should persist when navigating between pages.

**Examples:**
- User session data
- Products in cart
- Selected filters
- Draft content

**Why Redux?**
- Survives route changes
- No need to refetch on every navigation
- Maintains state consistency

#### 3. **Complex State Logic**
State that has complex update logic or depends on multiple actions.

**Examples:**
- Multi-step forms with validation
- Complex filtering/sorting logic
- Undo/redo functionality
- Real-time collaboration state

**Why Redux?**
- Centralized logic
- Easier to test
- Better separation of concerns
- Action history for debugging

#### 4. **Frequently Updated Data**
Data that changes frequently and affects multiple components.

**Examples:**
- Real-time notifications
- Live chat messages
- Stock prices
- Activity feeds

**Why Redux?**
- Efficient updates to multiple components
- Prevents unnecessary re-renders
- Better performance with selectors

#### 5. **Data That Needs Caching**
Data that should be cached to avoid repeated API calls.

**Examples:**
- User profile
- Product catalog
- Configuration settings
- Reference data (countries, categories, etc.)

**Why Redux?**
- Built-in caching mechanism
- Reduces API calls
- Faster user experience

---

## When to Use Local State

### ✅ Use Local State When:

#### 1. **Component-Specific UI State**
State that only affects a single component and doesn't need to be shared.

**Examples:**
- Modal open/close state
- Dropdown expanded/collapsed
- Tooltip visibility
- Loading spinners for specific actions
- Form validation errors

**Why Local State?**
- Simpler code
- No Redux boilerplate
- Component is self-contained
- Easier to maintain

#### 2. **Temporary/Transient Data**
Data that is only needed temporarily and can be discarded.

**Examples:**
- Search input value (before submission)
- Temporary form data
- Hover states
- Animation states
- Scroll positions

**Why Local State?**
- No need to persist
- Automatically cleaned up on unmount
- Lighter weight

#### 3. **Single-Use API Calls**
API calls that fetch data only used in one component.

**Examples:**
- Fetching details for a specific item on a details page
- Loading comments for a single post
- Fetching data for a chart on a dashboard widget
- One-time data validation

**Why Local State?**
- No need for global access
- Simpler implementation
- Automatic cleanup
- Less Redux store pollution

#### 4. **Form State (Simple Forms)**
Simple forms that don't need to persist or be accessed elsewhere.

**Examples:**
- Contact forms
- Search forms
- Comment forms
- Simple filters

**Why Local State?**
- Form libraries (Ant Design Form) handle state
- No need for global state
- Easier validation
- Automatic reset on submit

#### 5. **Page-Specific Data**
Data that is only relevant to a specific page and doesn't need to persist.

**Examples:**
- Pagination state
- Current tab selection
- Sorting preferences (if not saved)
- Expanded/collapsed sections

**Why Local State?**
- Resets when leaving page
- No need to clean up Redux
- Simpler code

---

## Decision Criteria

### Use This Checklist:

Ask yourself these questions in order:

```
1. Is this data needed by more than one component?
   ├─ YES → Consider Redux
   └─ NO  → Continue to #2

2. Does this data need to persist across route changes?
   ├─ YES → Use Redux
   └─ NO  → Continue to #3

3. Will this data be updated frequently from different sources?
   ├─ YES → Use Redux
   └─ NO  → Continue to #4

4. Is this data critical to the application (auth, user, etc.)?
   ├─ YES → Use Redux
   └─ NO  → Continue to #5

5. Does this data need to be cached to avoid repeated API calls?
   ├─ YES → Use Redux
   └─ NO  → Use Local State
```

### Scoring System

Give 1 point for each "YES":

- [ ] Used by 2+ components (1 point)
- [ ] Persists across routes (1 point)
- [ ] Updated frequently (1 point)
- [ ] Critical application data (1 point)
- [ ] Needs caching (1 point)
- [ ] Complex update logic (1 point)
- [ ] Needs debugging/time-travel (1 point)

**Score:**
- **4-7 points**: Use Redux
- **2-3 points**: Consider Redux or Context API
- **0-1 points**: Use Local State

---

## Real-World Examples

### Example 1: User Authentication ✅ Redux

**Why Redux?**
- ✅ Used by multiple components (Header, Sidebar, Protected Routes)
- ✅ Persists across all routes
- ✅ Critical application data
- ✅ Needs to be cached

**Implementation:**

```javascript
// ✅ CORRECT - Use Redux
// src/redux/authentication/actionCreator.js

export const login = (credentials, callback) => {
  return async (dispatch) => {
    dispatch(loginBegin());
    
    try {
      const response = await DataService.post('/user/login/', credentials);
      
      if (response.data.status === true) {
        Cookies.set('access_token', response.data.data.access);
        dispatch(loginSuccess(true));
        callback();
      }
    } catch (error) {
      dispatch(loginErr(error.message));
    }
  };
};

// Component usage
function LoginForm() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  
  const handleSubmit = (values) => {
    dispatch(login(values, () => navigate('/admin')));
  };
  
  return <Form onFinish={handleSubmit}>...</Form>;
}
```

### Example 2: Modal State ✅ Local State

**Why Local State?**
- ✅ Only used by one component
- ✅ Doesn't persist across routes
- ✅ Simple boolean state
- ✅ No caching needed

**Implementation:**

```javascript
// ✅ CORRECT - Use Local State
function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
      <Modal 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)}
      >
        Modal Content
      </Modal>
    </>
  );
}

// ❌ WRONG - Don't use Redux for this
// This is overkill and adds unnecessary complexity
```

### Example 3: Shopping Cart ✅ Redux

**Why Redux?**
- ✅ Used by multiple components (Header badge, Cart page, Checkout)
- ✅ Persists across routes
- ✅ Complex update logic (add, remove, update quantity)
- ✅ Needs caching

**Implementation:**

```javascript
// ✅ CORRECT - Use Redux
// src/redux/cart/actionCreator.js

export const addToCart = (product) => {
  return (dispatch, getState) => {
    const { cart } = getState();
    const existingItem = cart.items.find(item => item.id === product.id);
    
    if (existingItem) {
      dispatch(updateQuantity(product.id, existingItem.quantity + 1));
    } else {
      dispatch(addItem(product));
    }
  };
};

// Multiple components can access cart
function Header() {
  const cartCount = useSelector(state => state.cart.items.length);
  return <Badge count={cartCount}>Cart</Badge>;
}

function CartPage() {
  const cartItems = useSelector(state => state.cart.items);
  return <CartList items={cartItems} />;
}
```

### Example 4: Search Input ✅ Local State

**Why Local State?**
- ✅ Only used in search component
- ✅ Temporary data (until search is submitted)
- ✅ Simple string state
- ✅ Resets after search

**Implementation:**

```javascript
// ✅ CORRECT - Use Local State
function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = async () => {
    const response = await DataService.get(`/search?q=${searchTerm}`);
    setResults(response.data.data);
  };
  
  return (
    <>
      <Input 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Button onClick={handleSearch}>Search</Button>
      <SearchResults results={results} />
    </>
  );
}
```

### Example 5: User Profile ✅ Redux

**Why Redux?**
- ✅ Used by multiple components (Header, Settings, Profile page)
- ✅ Persists across routes
- ✅ Critical user data
- ✅ Needs caching (avoid repeated API calls)

**Implementation:**

```javascript
// ✅ CORRECT - Use Redux
// src/redux/authentication/actionCreator.js

export const getProfile = () => {
  return async (dispatch, getState) => {
    const { profile, profileLoading } = getState().auth;
    
    // Don't fetch if already loaded
    if (profile || profileLoading) return;
    
    dispatch(profileLoading(true));
    
    try {
      const response = await DataService.get('/user/profile/');
      dispatch(setUserProfile(response.data.data));
    } catch (error) {
      dispatch(profileErr(error.message));
    }
  };
};

// Multiple components use profile
function Header() {
  const profile = useSelector(state => state.auth.profile);
  return <Avatar src={profile?.avatar} />;
}

function ProfilePage() {
  const profile = useSelector(state => state.auth.profile);
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getProfile()); // Only fetches if not already loaded
  }, [dispatch]);
  
  return <ProfileForm initialValues={profile} />;
}
```

### Example 6: Form Data (Simple) ✅ Local State

**Why Local State?**
- ✅ Only used in form component
- ✅ Doesn't need to persist
- ✅ Ant Design Form handles state
- ✅ Resets after submit

**Implementation:**

```javascript
// ✅ CORRECT - Use Local State with Ant Design Form
function ContactForm() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await DataService.post('/contact', values);
      message.success('Message sent!');
      form.resetFields();
    } catch (error) {
      message.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Form form={form} onFinish={handleSubmit}>
      <Form.Item name="name">
        <Input placeholder="Name" />
      </Form.Item>
      <Form.Item name="email">
        <Input placeholder="Email" />
      </Form.Item>
      <Form.Item name="message">
        <Input.TextArea placeholder="Message" />
      </Form.Item>
      <Button htmlType="submit" loading={loading}>Send</Button>
    </Form>
  );
}
```

### Example 7: Notifications ✅ Redux

**Why Redux?**
- ✅ Used by multiple components (Header, Notification Center)
- ✅ Persists across routes
- ✅ Frequently updated
- ✅ Needs to be accessible globally

**Implementation:**

```javascript
// ✅ CORRECT - Use Redux
// src/redux/notification/actionCreator.js

export const fetchNotifications = () => {
  return async (dispatch) => {
    try {
      const response = await DataService.get('/notifications');
      dispatch(setNotifications(response.data.data));
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };
};

// Multiple components access notifications
function Header() {
  const unreadCount = useSelector(state => 
    state.notification.items.filter(n => !n.read).length
  );
  
  return <Badge count={unreadCount}><BellIcon /></Badge>;
}

function NotificationCenter() {
  const notifications = useSelector(state => state.notification.items);
  
  return (
    <List
      dataSource={notifications}
      renderItem={item => <NotificationItem {...item} />}
    />
  );
}
```

### Example 8: Pagination State ✅ Local State

**Why Local State?**
- ✅ Only used on current page
- ✅ Resets when leaving page
- ✅ Simple state management
- ✅ No need to persist

**Implementation:**

```javascript
// ✅ CORRECT - Use Local State
function ProductList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  
  useEffect(() => {
    fetchProducts();
  }, [page, pageSize]);
  
  const fetchProducts = async () => {
    const response = await DataService.get(
      `/products?page=${page}&size=${pageSize}`
    );
    setProducts(response.data.data.items);
    setTotal(response.data.data.total);
  };
  
  return (
    <>
      <ProductGrid products={products} />
      <Pagination 
        current={page}
        pageSize={pageSize}
        total={total}
        onChange={(newPage) => setPage(newPage)}
      />
    </>
  );
}
```

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Using Redux for Everything

**Problem:**
```javascript
// ❌ BAD - Modal state in Redux
const modalReducer = (state = { isOpen: false }, action) => {
  switch (action.type) {
    case 'OPEN_MODAL':
      return { isOpen: true };
    case 'CLOSE_MODAL':
      return { isOpen: false };
    default:
      return state;
  }
};

// Component
function MyComponent() {
  const dispatch = useDispatch();
  const isOpen = useSelector(state => state.modal.isOpen);
  
  return (
    <Modal 
      open={isOpen} 
      onClose={() => dispatch({ type: 'CLOSE_MODAL' })}
    />
  );
}
```

**Solution:**
```javascript
// ✅ GOOD - Use local state
function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Modal 
      open={isOpen} 
      onClose={() => setIsOpen(false)}
    />
  );
}
```

### ❌ Anti-Pattern 2: Duplicating API Calls

**Problem:**
```javascript
// ❌ BAD - Fetching same data in multiple components
function Header() {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    DataService.get('/user/profile/').then(res => {
      setProfile(res.data.data);
    });
  }, []);
  
  return <Avatar src={profile?.avatar} />;
}

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    // Same API call again!
    DataService.get('/user/profile/').then(res => {
      setProfile(res.data.data);
    });
  }, []);
  
  return <ProfileForm data={profile} />;
}
```

**Solution:**
```javascript
// ✅ GOOD - Use Redux to cache
// Fetch once, use everywhere
function Header() {
  const profile = useSelector(state => state.auth.profile);
  return <Avatar src={profile?.avatar} />;
}

function ProfilePage() {
  const profile = useSelector(state => state.auth.profile);
  const dispatch = useDispatch();
  
  useEffect(() => {
    if (!profile) {
      dispatch(getProfile()); // Only fetches if not cached
    }
  }, [dispatch, profile]);
  
  return <ProfileForm data={profile} />;
}
```

### ❌ Anti-Pattern 3: Not Using Local State When Appropriate

**Problem:**
```javascript
// ❌ BAD - Using Redux for component-specific loading state
const loadingReducer = (state = {}, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, [action.key]: action.value };
    default:
      return state;
  }
};

function MyComponent() {
  const dispatch = useDispatch();
  const loading = useSelector(state => state.loading.myComponent);
  
  const fetchData = async () => {
    dispatch({ type: 'SET_LOADING', key: 'myComponent', value: true });
    await DataService.get('/data');
    dispatch({ type: 'SET_LOADING', key: 'myComponent', value: false });
  };
}
```

**Solution:**
```javascript
// ✅ GOOD - Use local state for component-specific loading
function MyComponent() {
  const [loading, setLoading] = useState(false);
  
  const fetchData = async () => {
    setLoading(true);
    await DataService.get('/data');
    setLoading(false);
  };
}
```

### ❌ Anti-Pattern 4: Storing Derived Data in Redux

**Problem:**
```javascript
// ❌ BAD - Storing filtered data in Redux
const productsReducer = (state = { all: [], filtered: [] }, action) => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, all: action.data };
    case 'FILTER_PRODUCTS':
      return { 
        ...state, 
        filtered: state.all.filter(p => p.category === action.category) 
      };
    default:
      return state;
  }
};
```

**Solution:**
```javascript
// ✅ GOOD - Use selectors for derived data
const productsReducer = (state = [], action) => {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return action.data;
    default:
      return state;
  }
};

// Component
function ProductList() {
  const [category, setCategory] = useState('all');
  const allProducts = useSelector(state => state.products);
  
  // Derive filtered data in component
  const filteredProducts = category === 'all' 
    ? allProducts 
    : allProducts.filter(p => p.category === category);
  
  return <ProductGrid products={filteredProducts} />;
}
```

---

## Migration Guide

### When to Migrate from Local State to Redux

**Indicators:**
1. You're passing the same data through 3+ levels of components (prop drilling)
2. You're making the same API call in multiple components
3. You need to access the data after navigating to a different route
4. The state update logic is becoming complex

**Migration Steps:**

#### Step 1: Create Redux Actions

```javascript
// Before (Local State)
function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    DataService.get('/data').then(res => setData(res.data.data));
  }, []);
}

// After (Redux) - Create actions
// src/redux/myFeature/actions.js
const actions = {
  FETCH_BEGIN: 'FETCH_BEGIN',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERR: 'FETCH_ERR',
  
  fetchBegin: () => ({ type: actions.FETCH_BEGIN }),
  fetchSuccess: (data) => ({ type: actions.FETCH_SUCCESS, data }),
  fetchErr: (err) => ({ type: actions.FETCH_ERR, err }),
};

export default actions;
```

#### Step 2: Create Action Creator

```javascript
// src/redux/myFeature/actionCreator.js
import { DataService } from '../../config/dataService/dataService';
import actions from './actions';

export const fetchData = () => {
  return async (dispatch) => {
    dispatch(actions.fetchBegin());
    
    try {
      const response = await DataService.get('/data');
      dispatch(actions.fetchSuccess(response.data.data));
    } catch (error) {
      dispatch(actions.fetchErr(error.message));
    }
  };
};
```

#### Step 3: Create Reducer

```javascript
// src/redux/myFeature/reducers.js
import actions from './actions';

const initState = {
  data: null,
  loading: false,
  error: null,
};

const myFeatureReducer = (state = initState, action) => {
  switch (action.type) {
    case actions.FETCH_BEGIN:
      return { ...state, loading: true, error: null };
    case actions.FETCH_SUCCESS:
      return { ...state, data: action.data, loading: false };
    case actions.FETCH_ERR:
      return { ...state, error: action.err, loading: false };
    default:
      return state;
  }
};

export default myFeatureReducer;
```

#### Step 4: Add to Root Reducer

```javascript
// src/redux/rootReducers.js
import { combineReducers } from 'redux';
import myFeatureReducer from './myFeature/reducers';

const rootReducers = combineReducers({
  myFeature: myFeatureReducer,
  // ... other reducers
});

export default rootReducers;
```

#### Step 5: Update Component

```javascript
// After (Redux) - Use in component
import { useDispatch, useSelector } from 'react-redux';
import { fetchData } from '../redux/myFeature/actionCreator';

function MyComponent() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.myFeature);
  
  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);
  
  if (loading) return <Spin />;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}
```

### When to Migrate from Redux to Local State

**Indicators:**
1. Only one component uses this data
2. Data doesn't need to persist across routes
3. Redux store is becoming too large
4. Simple state that doesn't need debugging

**Migration Steps:**

```javascript
// Before (Redux)
function MyComponent() {
  const dispatch = useDispatch();
  const isOpen = useSelector(state => state.modal.isOpen);
  
  return (
    <Modal 
      open={isOpen} 
      onClose={() => dispatch(closeModal())}
    />
  );
}

// After (Local State)
function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Modal 
      open={isOpen} 
      onClose={() => setIsOpen(false)}
    />
  );
}

// Remove Redux files:
// - src/redux/modal/actions.js
// - src/redux/modal/actionCreator.js
// - src/redux/modal/reducers.js
// Update rootReducers.js to remove modal reducer
```

---

## Best Practices

### 1. Start with Local State, Migrate to Redux When Needed

```javascript
// ✅ GOOD - Start simple
function MyComponent() {
  const [data, setData] = useState(null);
  
  // If later you need this in multiple components, migrate to Redux
}

// ❌ BAD - Don't start with Redux unless you know you need it
```

### 2. Use Redux for Data, Local State for UI

```javascript
// ✅ GOOD
function ProductList() {
  // Redux for data
  const products = useSelector(state => state.products.items);
  
  // Local state for UI
  const [sortOrder, setSortOrder] = useState('asc');
  const [isGridView, setIsGridView] = useState(true);
  
  const sortedProducts = [...products].sort((a, b) => 
    sortOrder === 'asc' ? a.price - b.price : b.price - a.price
  );
  
  return isGridView 
    ? <Grid products={sortedProducts} />
    : <List products={sortedProducts} />;
}
```

### 3. Normalize Redux State

```javascript
// ❌ BAD - Nested data
{
  products: [
    { id: 1, name: 'Product 1', category: { id: 1, name: 'Category 1' } },
    { id: 2, name: 'Product 2', category: { id: 1, name: 'Category 1' } },
  ]
}

// ✅ GOOD - Normalized data
{
  products: {
    byId: {
      1: { id: 1, name: 'Product 1', categoryId: 1 },
      2: { id: 2, name: 'Product 2', categoryId: 1 },
    },
    allIds: [1, 2]
  },
  categories: {
    byId: {
      1: { id: 1, name: 'Category 1' }
    },
    allIds: [1]
  }
}
```

### 4. Use Selectors for Computed Data

```javascript
// ✅ GOOD - Use selectors
// src/redux/products/selectors.js
export const selectAllProducts = (state) => state.products.allIds.map(
  id => state.products.byId[id]
);

export const selectProductsByCategory = (state, categoryId) => 
  selectAllProducts(state).filter(p => p.categoryId === categoryId);

// Component
function ProductList({ categoryId }) {
  const products = useSelector(state => 
    selectProductsByCategory(state, categoryId)
  );
  
  return <ProductGrid products={products} />;
}
```

### 5. Keep Redux Actions Simple

```javascript
// ✅ GOOD - Simple, focused actions
export const fetchProducts = () => async (dispatch) => {
  dispatch(fetchBegin());
  try {
    const response = await DataService.get('/products');
    dispatch(fetchSuccess(response.data.data));
  } catch (error) {
    dispatch(fetchErr(error.message));
  }
};

// ❌ BAD - Too much logic in action
export const fetchProductsAndUpdateUI = () => async (dispatch) => {
  dispatch(fetchBegin());
  dispatch(showLoading());
  dispatch(clearErrors());
  try {
    const response = await DataService.get('/products');
    dispatch(fetchSuccess(response.data.data));
    dispatch(hideLoading());
    dispatch(showSuccessMessage('Products loaded'));
    dispatch(updateLastFetchTime(Date.now()));
  } catch (error) {
    dispatch(fetchErr(error.message));
    dispatch(hideLoading());
    dispatch(showErrorMessage(error.message));
  }
};
```

### 6. Clean Up on Unmount (Local State)

```javascript
// ✅ GOOD - Clean up subscriptions
function MyComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      const response = await DataService.get('/data');
      if (isMounted) {
        setData(response.data.data);
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false; // Cleanup
    };
  }, []);
}
```

### 7. Avoid Storing Everything in Redux

```javascript
// ❌ BAD - Storing form state in Redux
const formReducer = (state = {}, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value };
    default:
      return state;
  }
};

// ✅ GOOD - Use Ant Design Form or local state
function MyForm() {
  const [form] = Form.useForm();
  
  const handleSubmit = async (values) => {
    await DataService.post('/submit', values);
  };
  
  return <Form form={form} onFinish={handleSubmit}>...</Form>;
}
```

---

## Performance Considerations

### Redux Performance Tips

#### 1. Use Selectors with Memoization

```javascript
import { createSelector } from 'reselect';

// ✅ GOOD - Memoized selector
const selectProducts = (state) => state.products.items;
const selectCategory = (state, category) => category;

const selectFilteredProducts = createSelector(
  [selectProducts, selectCategory],
  (products, category) => {
    console.log('Filtering products...'); // Only runs when inputs change
    return products.filter(p => p.category === category);
  }
);

// Component
function ProductList({ category }) {
  const products = useSelector(state => 
    selectFilteredProducts(state, category)
  );
  
  return <ProductGrid products={products} />;
}
```

#### 2. Split Large Reducers

```javascript
// ❌ BAD - One large reducer
const appReducer = (state = {}, action) => {
  // Handles everything
};

// ✅ GOOD - Split by feature
const rootReducer = combineReducers({
  auth: authReducer,
  products: productsReducer,
  cart: cartReducer,
  notifications: notificationReducer,
});
```

#### 3. Avoid Unnecessary Re-renders

```javascript
// ❌ BAD - Selecting entire state object
function MyComponent() {
  const state = useSelector(state => state); // Re-renders on any state change
  
  return <div>{state.products.items.length}</div>;
}

// ✅ GOOD - Select only what you need
function MyComponent() {
  const productCount = useSelector(state => state.products.items.length);
  
  return <div>{productCount}</div>;
}
```

### Local State Performance Tips

#### 1. Use useCallback for Event Handlers

```javascript
// ✅ GOOD
function MyComponent() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  
  return <ExpensiveChild onClick={handleClick} />;
}
```

#### 2. Use useMemo for Expensive Calculations

```javascript
// ✅ GOOD
function ProductList({ products }) {
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => a.price - b.price);
  }, [products]);
  
  return <ProductGrid products={sortedProducts} />;
}
```

---

## Code Templates

### Template 1: Redux API Call (Global Data)

```javascript
// 1. actions.js
const actions = {
  FETCH_BEGIN: 'FETCH_BEGIN',
  FETCH_SUCCESS: 'FETCH_SUCCESS',
  FETCH_ERR: 'FETCH_ERR',
  
  fetchBegin: () => ({ type: actions.FETCH_BEGIN }),
  fetchSuccess: (data) => ({ type: actions.FETCH_SUCCESS, data }),
  fetchErr: (err) => ({ type: actions.FETCH_ERR, err }),
};

export default actions;

// 2. actionCreator.js
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
        dispatch(actions.fetchErr('Failed to fetch'));
      }
    } catch (error) {
      dispatch(actions.fetchErr(error.message));
    }
  };
};

// 3. reducers.js
import actions from './actions';

const initState = {
  data: null,
  loading: false,
  error: null,
};

const myReducer = (state = initState, action) => {
  switch (action.type) {
    case actions.FETCH_BEGIN:
      return { ...state, loading: true, error: null };
    case actions.FETCH_SUCCESS:
      return { ...state, data: action.data, loading: false };
    case actions.FETCH_ERR:
      return { ...state, error: action.err, loading: false };
    default:
      return state;
  }
};

export default myReducer;

// 4. Component
import { useDispatch, useSelector } from 'react-redux';
import { fetchData } from '../redux/myFeature/actionCreator';

function MyComponent() {
  const dispatch = useDispatch();
  const { data, loading, error } = useSelector(state => state.myFeature);
  
  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);
  
  if (loading) return <Spin />;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}
```

### Template 2: Local State API Call (Component-Specific)

```javascript
import React, { useState, useEffect } from 'react';
import { DataService } from '../config/dataService/dataService';
import { message, Spin } from 'antd';

function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await DataService.get('/endpoint');
      
      if (response.data.status === true) {
        setData(response.data.data);
      } else {
        setError('Failed to fetch data');
        message.error('Failed to fetch data');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      message.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <Spin />;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{JSON.stringify(data)}</div>;
}

export default MyComponent;
```

---

## Summary Cheat Sheet

### Use Redux For:
✅ User authentication  
✅ User profile  
✅ Shopping cart  
✅ Notifications  
✅ Global settings  
✅ Data shared across routes  
✅ Data shared across components  
✅ Complex state logic  
✅ Data that needs caching  

### Use Local State For:
✅ Modal open/close  
✅ Form inputs  
✅ Search input  
✅ Dropdown expanded/collapsed  
✅ Loading spinners (component-specific)  
✅ Pagination state  
✅ Sorting/filtering (if not saved)  
✅ Temporary data  
✅ UI-only state  

### Quick Decision:
```
Multiple components need it? → Redux
Persists across routes? → Redux
Critical app data? → Redux
Component-specific UI? → Local State
Temporary data? → Local State
Simple boolean/string? → Local State
```

---

**Last Updated**: February 9, 2026  
**Version**: 1.0  
**Maintained by**: Development Team
