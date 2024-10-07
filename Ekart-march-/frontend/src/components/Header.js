import {Link} from 'react-router-dom'
import './Header.css'
import { useNavigate} from 'react-router-dom'
import {useContext } from 'react'
import { AuthContext } from '../context/authContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';



const Header = () => {
  //const { productCount } = useContext(ProductCountContext);
  
 
  //const [count,setCount] = useState(0)
  const navigate = useNavigate()
  const {  logout } = useContext(AuthContext);

  const handleLogoutClick = async () => {
    try {
      await handleLogout();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };
  
  return(
  <nav className="nav-header">
    <div className="nav-content">
      <img
        className="website-logo"
        src="https://i.ibb.co/QrVMnhp/flybuy.png"
        alt="website logo"
      />
      <ul className="nav-menu">
        <li>
          <Link to="/" className="nav-link">
            Home
          </Link>
        </li>
        <li>
          <Link to="/products" className="nav-link">
            Products
          </Link>
        </li>
        <li>
          {/*
          <Link to="/cart" className="nav-link">
            Cart {productCount!==0 && <span className='cart-count-badge'>{productCount}</span>}
          </Link>
  */ }
          <Link to="/cart" className="nav-link">
            <FontAwesomeIcon icon={faShoppingCart} /> Cart 
          </Link>
          {/* <span className="cart-count-badge"></span> */}
        </li>
        <li>
          <Link to='/myorders' className="nav-link">
            My Orders
          </Link>
        </li>
        <li class="dropdown">
        <Link to='#' className="nav-link">More</Link>
            <div class="dropdown-content">
            <Link to='/contactus' className="nav-link">Contact Us</Link>
            <Link to='#' className="nav-link">Download App</Link>
            </div>
        </li>
      </ul>
      <button type="button" className="logout-desktop-btn" onClick={handleLogoutClick}>
        Logout
      </button>
      
    </div>
  </nav>
)
}
export default Header
