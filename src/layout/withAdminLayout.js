/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/prop-types */
// import UilEllipsisV from '@iconscout/react-unicons/icons/uil-ellipsis-v';
import { Button, Col, Layout, Row } from 'antd';
import propTypes from 'prop-types';
import { Component } from 'react';
import { Scrollbars } from '@pezhmanparsaee/react-custom-scrollbars';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { HiOutlineChartBar } from 'react-icons/hi2';
import MenueItems from './MenueItems';
// import CustomizerWrap from './overview/Customizer';
import { FooterStyle, LayoutContainer, SmallScreenAuthInfo, TopMenuSearch } from './Style';
// import TopMenu from './TopMenu';
import Search from '../components/utilities/auth-info/Search';
import AuthInfo from '../components/utilities/auth-info/info';
import { ReactComponent as MySVG } from '../static/img/icon/left-bar.svg';

const { theme } = require('../config/theme/themeVariables');

const { Header, Sider, Content } = Layout;

const ThemeLayout = (WrappedComponent) => {
  class LayoutComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        collapsed: false,
        hide: true,
      };
      this.updateDimensions = this.updateDimensions.bind(this);
    }

    componentDidMount() {
      window.addEventListener('resize', this.updateDimensions);
      this.updateDimensions();
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.updateDimensions);
    }

    updateDimensions() {
      this.setState({
        collapsed: window.innerWidth <= 1200 && true,
      });
    }

    render() {
      const { collapsed, hide } = this.state;
      const { layoutMode, rtl, topMenu } = this.props;

      const left = !rtl ? 'left' : 'right';
      const toggleCollapsed = () => {
        this.setState({
          collapsed: !collapsed,
        });
      };

      const toggleCollapsedMobile = () => {
        if (window.innerWidth <= 990) {
          this.setState({
            collapsed: !collapsed,
          });
        }
      };

      // const onShowHide = () => {
      //   this.setState({
      //     hide: !hide,
      //   });
      // };

      const SideBarStyle = {
        margin: '63px 0 0 0',
        padding: `${!rtl ? '20px 20px 55px 0' : '20px 0 55px 20px'}`,
        overflowY: 'auto',
        height: '100vh',
        position: 'fixed',
        [left]: 0,
        zIndex: 988,
      };

      function renderThumb({ style }) {
        const thumbStyle = {
          borderRadius: 6,
          backgroundColor: '#F1F2F6',
        };
        return <div style={{ ...style, ...thumbStyle }} />;
      }
      const renderTrackVertical = () => {
        const thumbStyle = {
          position: 'absolute',
          width: '6px',
          transition: 'opacity 200ms ease 0s',
          opacity: 0,
          [rtl ? 'left' : 'right']: '0px',
          bottom: '2px',
          top: '2px',
          borderRadius: '3px',
        };
        return <div className="[&>div]:bg-regular dark:[&>div]:bg-[#32333f]" style={thumbStyle} />;
      };
      function renderView({ style }) {
        const customStyle = {
          marginRight: rtl && 'auto',
          [rtl ? 'marginLeft' : 'marginRight']: '-17px',
        };
        return <div style={{ ...style, ...customStyle }} />;
      }
      renderThumb.propTypes = {
        style: propTypes.shape(propTypes.object),
      };
      renderView.propTypes = {
        style: propTypes.shape(propTypes.object),
      };

      return (
        <LayoutContainer>
          <Layout className="layout">
            <Header
              style={{
                position: 'fixed',
                width: '100%',
                top: 0,
                [!rtl ? 'left' : 'right']: 0,
                height: '80px', // Increased height slightly
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
                zIndex: 998,
              }}
              className="p-0 flex items-center justify-between shadow-sm transition-all duration-300"
            >
              <div className="flex flex-row items-center flex-1 h-full px-[3%]">
                {/* Logo Area */}
                <div className="flex items-center gap-4 min-w-[200px]">
                  {!topMenu || window.innerWidth <= 991 ? (
                    <Button
                      type="link"
                      className="p-2 mb-0 bg-gray-50 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 rounded-lg border border-gray-100 transition-all"
                      onClick={toggleCollapsed}
                    >
                      <MySVG className="w-5 h-5" />
                    </Button>
                  ) : null}

                  <Link className="flex items-center gap-2 cursor-pointer group" to="/admin/profit/summary">
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                      <HiOutlineChartBar className="text-white" size={20} />
                    </div>
                    <p className="hidden min-md:block text-xl font-bold text-gray-800 mb-0 tracking-tight group-hover:text-emerald-600 transition-colors">
                      Profit-Tracker
                    </p>
                  </Link>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center justify-end flex-auto">
                  {/* Mobile Auth Info */}
                  <div className="flex flex-row items-center md:hidden">
                    {topMenu && window.innerWidth > 991 ? (
                      <TopMenuSearch>
                        <div className="flex top-right-wrap">
                          <AuthInfo />
                        </div>
                      </TopMenuSearch>
                    ) : (
                      <AuthInfo />
                    )}
                  </div>

                  {/* Desktop Actions */}
                  <div className="hidden md:flex items-center gap-2">
                    <div className="relative">
                      <Search />
                    </div>
                    {/* <div className="h-8 w-[1px] bg-gray-200 mx-2" /> Divider */}
                    {/* <AuthInfo /> - Assuming AuthInfo contains the user dropdown */}
                    {/* Re-adding AuthInfo here as it was commented out in original file but typically needed */}
                    <AuthInfo />
                  </div>
                </div>
              </div>
            </Header>
            <Row>
              <Col md={0} sm={24} xs={24}>
                <SmallScreenAuthInfo hide={hide}>
                  <AuthInfo rtl={rtl} />
                </SmallScreenAuthInfo>
              </Col>
            </Row>
            <Layout>
              {!topMenu || window.innerWidth <= 991 ? (
                <ThemeProvider theme={theme}>
                  <Sider
                    width={280}
                    style={SideBarStyle}
                    collapsed={collapsed}
                    theme={layoutMode === 'lightMode' ? 'light' : 'dark'}
                  >
                    <Scrollbars
                      className="custom-scrollbar"
                      autoHide
                      autoHideTimeout={500}
                      autoHideDuration={200}
                      // renderThumbHorizontal={renderThumbHorizontal}
                      renderThumbVertical={renderThumb}
                      renderView={renderView}
                      renderTrackVertical={renderTrackVertical}
                    >
                      <MenueItems topMenu={topMenu} toggleCollapsed={toggleCollapsedMobile} />
                    </Scrollbars>
                  </Sider>
                </ThemeProvider>
              ) : null}
              <Layout className="atbd-main-layout">
                <Content>
                  <WrappedComponent {...this.props} />
                  <FooterStyle className="bg-white dark:bg-[#1B1E2B]">
                    <Row>
                      <Col md={12} xs={24}>
                        <span className="inline-block w-full font-medium admin-footer__copyright md:text-center text-theme-gray dark:text-white60 md:mb-[10px]">
                          © 2025
                          <Link className="mx-[4px] text-primary" to="#">
                            Profit-Tracker
                          </Link>
                        </span>
                      </Col>
                      {/* <Col md={12} xs={24}>
                        <div className="justify-end md:justify-center items-center flex gap-[15px]">
                          <NavLink className="text-theme-gray dark:text-white60 text-[14px] hover:text-primary" to="#">
                            About
                          </NavLink>
                          <NavLink className="text-theme-gray dark:text-white60 text-[14px] hover:text-primary" to="#">
                            Team
                          </NavLink>
                          <NavLink className="text-theme-gray dark:text-white60 text-[14px] hover:text-primary" to="#">
                            Contact
                          </NavLink>
                        </div>
                      </Col> */}
                    </Row>
                  </FooterStyle>
                </Content>
              </Layout>
            </Layout>
          </Layout>
          {window.innerWidth <= 991 ? (
            <span className={collapsed ? 'hexadash-shade' : 'hexadash-shade show'} onClick={toggleCollapsed} />
          ) : (
            ''
          )}
        </LayoutContainer>
      );
    }
  }

  const mapStateToProps = (state) => {
    return {
      layoutMode: state.ChangeLayoutMode.mode,
      rtl: state.ChangeLayoutMode.rtlData,
      topMenu: state.ChangeLayoutMode.topMenu,
    };
  };

  LayoutComponent.propTypes = {
    layoutMode: propTypes.string,
    rtl: propTypes.bool,
    topMenu: propTypes.bool,
  };

  return connect(mapStateToProps)(LayoutComponent);
};
export default ThemeLayout;
