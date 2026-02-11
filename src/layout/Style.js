import { Layout } from 'antd';
import Styled from 'styled-components';

const { Footer } = Layout;

const NavTitle = Styled.p`
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
    color: rgb(146, 153, 184);
    padding: 0px 15px;
    display: flex;
`;

const LayoutContainer = Styled.div`
    /* Sidebar styles */
    .ant-layout-sider {
        background: #ffffff;
        border-right: 1px solid #f3f4f6;
        
        @media (max-width: 991px){
            box-shadow: 0 0 10px #00000020;
        }
        @media print {
            display: none;
        }

        .custom-scrollbar{
            .hexadash-track-vertical{
                position: absolute;
                width: 6px;
                transition: opacity 200ms ease 0s;
                opacity: 0;
                ${({ theme }) => (!theme.rtl ? 'right' : 'left')}: 2px;
                bottom: 2px;
                top: 2px;
                border-radius: 3px;
                >div{
                    background-color: #e2e8f0 !important;
                }
            }
        }

        .ant-menu{
            background-color: transparent;
            padding: 10px;
        }

        &.ant-layout-sider-collapsed{
            padding: 15px 0px 55px !important;
            .ant-layout-sider-children{
                .hexadash-sidebar-nav-title{
                    display: none;
                }
            }
            & + .atbd-main-layout{
                ${({ theme }) => (!theme.rtl ? 'margin-left' : 'margin-right')}: 80px;

            }
            .ant-menu-item-group{
                display: none;
            }
            .ant-menu-item{
                color: #333;
                .badge{
                    display: none;
                }
            }
            .ant-layout-sider-children{
                .ant-menu .ant-menu-submenu, 
                .ant-layout-sider-children .ant-menu .ant-menu-item{
                    ${({ theme }) => (!theme.rtl ? 'padding-right' : 'padding-left')}: 0;
                    justify-content: center;
                }
            }
        }

        &.ant-layout-sider-dark{
            background: #1b1e2b;
            .ant-layout-sider-children{
                .ant-menu{
                    .ant-menu-submenu-inline{
                        > .ant-menu-submenu-title{
                            padding: 0 15px !important;
                        }
                    }
                    .ant-menu-item{
                        padding: 0 15px !important;
                    }
                }
            }
        }

        .ant-layout-sider-children{
            padding-bottom: 15px;
            
            /* Section Titles */
            .hexadash-sidebar-nav-title {
                display: flex;
                font-size: 11px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #94a3b8;
                padding: 0 20px;
                margin: 24px 0 8px 0;
            }

            .ant-menu{
                font-size: 14px;
                overflow-x: hidden;
                border-right: none;
                
                /* Submenu container */
                .ant-menu-sub.ant-menu-inline{
                    background-color: #f8fafc; /* Very light gray for submenu area */
                    border-radius: 12px;
                    margin: 5px 10px;
                    width: calc(100% - 20px) !important;
                    padding: 5px 0;
                }
                
                .ant-menu-submenu-selected{
                    color: #0d9488;
                }

                /* Menu Item & Submenu Title wrapper */
                .ant-menu-submenu, 
                .ant-menu-item{
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    
                    /* Base Item Styling */
                    &.ant-menu-item, 
                    .ant-menu-submenu-title {
                        margin: 4px 0 !important;
                        border-radius: 12px; /* Pill shape */
                        color: #64748b; /* Slate 500 */
                        height: 48px;
                        line-height: 48px;
                        overflow: hidden;
                        width: 100%;
                        
                        &:hover {
                            color: #059669; /* Emerald 600 */
                            background-color: #ecfdf5; /* Emerald 50 */
                            
                            svg, i {
                                color: #059669;
                            }
                        }
                    }

                    /* Active/Selected Styling */
                    &.ant-menu-item-selected{
                        background: linear-gradient(135deg, #10b981 0%, #0f766e 100%); /* Emerald 500 to Teal 700 */
                        color: #ffffff;
                        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
                        
                        &:after{
                            content: none; /* Remove default styling */
                        }
                        
                        a {
                            color: #ffffff;
                        }
                        
                        svg, i {
                            color: #ffffff !important;
                        }
                        
                        &:hover {
                            background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
                            color: #ffffff;
                        }
                    }

                    /* Submenu Title Active State (when child is active) */
                    &.ant-menu-submenu-active, &.ant-menu-submenu-open {
                         >.ant-menu-submenu-title {
                            color: #0f766e;
                            svg {
                                color: #0f766e;
                            }
                         }
                    }
                    
                    /* Icons */
                    .ant-menu-item-icon {
                        min-width: 18px;
                        svg {
                            transition: color 0.3s;
                        }
                    }

                    svg, img {
                        width: 18px;
                        font-size: 18px;
                        color: #94a3b8; /* Slate 400 */
                    }
                    
                    /* Text Label */
                    span{
                        display: inline-block;
                        transition: 0.3s ease;
                        font-weight: 500;
                    }

                    .ant-menu-title-content{
                        margin-left: 10px;
                    }
                }

                /* Submenu specific tweaks */
                .ant-menu-submenu {
                    .ant-menu-sub {
                        .ant-menu-item {
                            padding-left: 20px !important; 
                            height: 40px;
                            line-height: 40px;
                            margin: 2px 0 !important;
                            border-radius: 8px; /* Slightly smaller radius for children */
                            
                            &.ant-menu-item-selected {
                                background: linear-gradient(135deg, #10b981 0%, #0f766e 100%); /* Emerald 500 to Teal 700 */
                                color: #ffffff;
                                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
                                font-weight: 600;
                                
                                &:before {
                                   content: none;
                                }

                                a { color: #ffffff; }
                            }
                            
                            &:hover {
                                background-color: #f1f5f9;
                            }
                        }
                    }
                    &.ant-menu-submenu-open {
                        >.ant-menu-submenu-title {
                             .ant-menu-submenu-arrow {
                                 color: #0f766e;
                             }
                        }
                    }
                }
                
                /* Collapsed State Overrides */
                &.ant-menu-inline-collapsed{
                    .ant-menu-submenu-title, .ant-menu-item {
                        padding: 0 calc(50% - 20px) !important; /* Center icons */
                        .ant-menu-title-content { display: none; }
                    }
                }
            }
        }
    }
    @media only screen and (max-width: 1150px){
        .ant-layout-sider.ant-layout-sider-collapsed{
            ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: -80px !important;
        }

    }

    .atbd-main-layout{
        ${({ theme }) => (!theme.rtl ? 'margin-left' : 'margin-right')}: ${({ theme }) =>
  theme.topMenu ? 0 : '280px'};
        margin-top: 74px;
        transition: 0.3s ease;
        
        @media only screen and (max-width: 1150px){
            ${({ theme }) => (!theme.rtl ? 'margin-left' : 'margin-right')}: auto !important;
        }
        @media print {
            width: 100%;
            margin-left: 0;
            margin-right: 0;
        }
    }
    .admin-footer{
        background-color: ${({ theme }) => theme[theme.mainContent]['white-background']};
        @media print {
            display: none;
        }
        .admin-footer__copyright{
            display: inline-block;
            width: 100%;
            font-weight: 500;
            color: ${({ theme }) => theme[theme.mainContent]['gray-text']};
            @media only screen and (max-width: 767px){
                text-align: center;
                margin-bottom: 10px;
            }
            a{
                display: inline-block;
                margin-left: 4px;
                font-weight: 500;
                color: ${({ theme }) => theme['primary-color']};
            }
        }
        
    }
    /* Common Styles */
    .ant-radio-button-wrapper-checked {
        &:not(.ant-radio-button-wrapper-disabled){
            background: ${({ theme }) => theme[theme.mainContent].white};
            border-color: ${({ theme }) => theme[theme.mainContent]['menu-active']};
            color: ${({ theme }) => theme[theme.mainContent]['white-text']};
            &:hover{
                border-color: ${({ theme }) => theme[theme.mainContent]['menu-active']};
            }
        }
    }
    .hexadash-shade{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255,255,255,0);
        content: "";
        z-index: -1;
        &.show{
            z-index: 101;
        }
    }
`;

const SmallScreenAuthInfo = Styled.div`
    background-color: ${({ theme }) => theme[theme.mainContent]['white-background']};
    width: 100%;
    position: fixed;
    margin-top: ${({ hide }) => (hide ? '0px' : '72px')};
    top: 0;
    ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: 0;
    transition: .3s;
    opacity: ${({ hide }) => (hide ? 0 : 1)};
    z-index: ${({ hide }) => (hide ? -1 : 1)};
    box-shadow: 0 2px 30px #9299b810;
    padding: 10px 0;
    @media only screen and (max-width: 767px){
        padding: 10px 15px;
        border-top: 1px solid  ${({ theme }) => theme[theme.mainContent]['border-color-default']};
    }
    .hexadash-nav-actions__searchbar{
        display: none !important;
    }
`;

const SmallScreenSearch = Styled.div`
        background-color: ${({ theme }) => theme[theme.mainContent]['white-background']};
        width: 100%;
        position: fixed;
        margin-top: ${({ hide }) => (hide ? '0px' : '64px')};
        top: 0;
        ${({ theme }) => (!theme.rtl ? 'left' : 'right')}: 0;
        transition: .3s;
        opacity: ${({ hide }) => (hide ? 0 : 1)};
        z-index: ${({ hide }) => (hide ? -1 : 999)};
        box-shadow: 0 2px 30px #9299b810;

`;

const ModeSwitch = Styled.div`
    background: #ddd;
    width: 200px;
    position: fixed;
    ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 0;
    top: 50%;
    margin-top: -100px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    padding: 15px;
    border-radius: 5px;
    button{
        margin-top: 5px;
    }
`;

const TopMenuSearch = Styled.div`
    .top-right-wrap{
        position: relative;
        float: ${({ theme }) => (theme.rtl ? 'left' : 'right')};
    }
    .search-toggle{
        display: flex;
        align-items: center;
        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 10px;
        color: ${({ theme }) => theme[theme.mainContent]['gray-text']};
        .feather-x{
            display: none;
        }
        .feather-search{
            display: flex;
        }
        &.active{
            .feather-search{
                display: none;
            }
            .feather-x{
                display: flex;
            }
        }
        svg,
        img{
            width: 20px;
        }
    }
    .topMenu-search-form{
        position: absolute;
        ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 100%;
        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 15px;
        top: 12px;
        background-color: #fff;
        border: 1px solid ${({ theme }) => theme['border-color-normal']};
        border-radius: 6px;
        height: 40px;
        width: 280px;
        display: none;
        &.show{
            display: block;
        }
        .search-icon{
            width: fit-content;
            line-height: 1;
            position: absolute;
            left: 15px;
            ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 15px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 9999;
        }
        i,
        svg{
            width: 18px;
            background-color: ${({ theme }) => theme[theme.mainContent]['gray-light-text']};
        }
        form{
            height: auto;
            display: flex;
            align-items: center;
        }
        input{
            position: relative;
            border-radius: 6px;
            width: 100%;
            border: 0 none;
            height: 38px;
            padding-left: 40px;
            z-index: 999;
            ${({ theme }) => (theme.rtl ? 'padding-right' : 'padding-left')}: 40px;
            &:focus{
                border: 0 none;
                box-shadow: 0 0;
                outline: none;
            }
        }
    }
`;

const TopMenuStyle = Styled.div`
    .hexadash-top-menu{
        ul{
            margin-bottom: 0;
            li{
                display: inline-block;
                position: relative;
                ${({ theme }) => (theme.rtl ? 'padding-left' : 'padding-right')}: 14px;
                @media only screen and (max-width: 1024px){
                    ${({ theme }) => (theme.rtl ? 'padding-left' : 'padding-right')}: 10px;
                }
                &:not(:last-child){
                    ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 34px;
                    @media only screen and (max-width: 1399px){
                        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 30px;
                    }
                    @media only screen and (max-width: 1199px){
                        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 20px;
                    }
                    @media only screen and (max-width: 1024px){
                        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 13px;
                    }
                }
                .parent.active{
                    color: ${({ theme }) => theme[theme.mainContent]['menu-active']};
                }
                &.has-subMenu{
                    >a{
                        position: relative;
                        &:before{
                            position: absolute;
                            ${({ theme }) => (theme.rtl ? 'left' : 'right')}: -14px;
                            top: 50%;
                            transform: translateY(-50%);
                            font-family: "FontAwesome";
                            content: '\f107';
                            line-height: 1;
                            color: ${({ theme }) => theme[theme.mainContent]['light-text']};
                        }
                        &.active{
                            &:before{
                                color: ${({ theme }) => theme[theme.mainContent]['menu-active']};
                            }
                        }
                    }
                }
                &.has-subMenu-left{
                    >a{
                        position: relative;
                        &:before{
                            position: absolute;
                            ${({ theme }) => (theme.rtl ? 'left' : 'right')}: 30px;
                            top: 50%;
                            transform: translateY(-50%);
                            font-family: "FontAwesome";
                            content: '\f105';
                            line-height: 1;
                            color: ${({ theme }) => theme[theme.mainContent]['light-text']};
                        }
                    }
                }
                &:hover{
                    >.subMenu{
                        top: 70px;
                        opacity: 1;
                        visibility: visible;
                        @media only screen and (max-width: 1399px){
                            top: 40px;
                        }
                    }
                }
                >a{
                    padding: 24px 0;
                    line-height: 1.5;
                    @media only screen and (max-width: 1399px){
                        padding: 6px 0;
                    }
                }
                a{
                    display: flex;
                    align-items: center;
                    font-weight: 500;
                    color: ${({ theme }) => theme[theme.mainContent]['light-text']};
                    &.active{
                        color: ${({ theme }) => theme[theme.mainContent]['light-text']};
                    }
                    svg,
                    img,
                    i{
                        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 14px;
                        width: 16px;
                    }
                }
                >ul{
                    li{
                        display: block;
                        position: relative;
                        ${({ theme }) => (theme.rtl ? 'padding-left' : 'padding-right')}: 0;
                        ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 0 !important;
                        a{
                            font-weight: 400;
                            padding: 0 30px;
                            line-height: 3;
                            color: ${({ theme }) => theme[theme.mainContent]['light-text']};
                            transition: .3s;
                            &:hover,
                            &[aria-current="page"]{
                                color: ${({ theme }) => theme[theme.mainContent]['menu-active']};
                                background-color: ${({ theme }) => theme[theme.mainContent]['menu-active']}06;
                                ${({ theme }) => (theme.rtl ? 'padding-right' : 'padding-left')}: 40px;
                            }
                        }
                        &:hover{
                            .subMenu{
                                top: 0;
                                ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 250px;
                                @media only screen and (max-width: 1300px){
                                    ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 180px;
                                }
                            }
                        }
                    }
                }
            }
        }
        .subMenu{
            width: 250px;
            background: ${({ theme }) => theme[theme.mainContent]['white-background']};
            border-radius: 6px;
            position: absolute;
            ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 0;
            top: 80px;
            padding: 12px 0;
            visibility: hidden;
            opacity: 0;
            transition: 0.3s;
            z-index: 98;
            box-shadow: 0px 15px 40px 0px rgba(82, 63, 105, 0.15);
            @media only screen and (max-width: 1300px){
                width: 180px;
            }
            .subMenu{
                width: 250px;
                background:${({ theme }) => theme[theme.mainContent]['white-background']};
                position: absolute;
                ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 250px;
                top: 0px;
                padding: 12px 0;
                visibility: hidden;
                opacity: 0;
                transition: 0.3s;
                z-index: 98;
                box-shadow: 0px 15px 40px 0px rgba(82, 63, 105, 0.15);
                @media only screen and (max-width: 1300px){
                    width: 200px;
                    ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 180px;
                }
            }
        }
    }
    .hexadash-top-menu{
        >ul{
            display: flex;
            flex-wrap: wrap;
        }
    }
    // Mega Menu
    .hexadash-top-menu{
        >ul{
            >li{
                &:hover{
                    .megaMenu-wrapper{
                        opacity: 1;
                        visibility: visible;
                        z-index: 99;
                    }
                }
                &.mega-item{
                    position: static;
                }
                .sDash_menu-item-icon{
                    line-height: .6;
                }
                .megaMenu-wrapper{
                    display: flex;
                    position: absolute;
                    text-align: ${({ theme }) => (theme.rtl ? 'right' : 'left')}
                    ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 0;
                    top: 100%;
                    overflow: hidden;
                    z-index: -1;
                    padding: 16px 0;
                    box-shadow: 0px 15px 40px 0px rgba(82, 63, 105, 0.15);
                    border-radius: 0 0 6px 6px;
                    opacity: 0;
                    visibility: hidden;
                    transition: .4s;
                    background-color: ${({ theme }) => theme[theme.mainContent]['white-background']};
                    &.megaMenu-small{
                        width: 590px;
                        >li{
                            flex: 0 0 33.3333%;
                        }
                        ul{
                            li{
                                >a{
                                    padding: 0 35px;
                                    position: relative
                                    &:after{
                                        width: 5px;
                                        height: 5px;
                                        border-radius: 50%;
                                        position: absolute;
                                        ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 30px;
                                        top: 50%;
                                        transform: translateY(-50%);
                                        background-color: #C6D0DC;
                                        content: '';
                                        transition: .3s;
                                    }
                                    &:hover,
                                    &[aria-current="page"]{
                                        ${({ theme }) => (theme.rtl ? 'padding-right' : 'padding-left')}: 35px;
                                        color: ${({ theme }) => theme[theme.mainContent]['menu-active']};
                                        &:after{
                                            background-color: ${({ theme }) => theme['primary-color']};;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    &.megaMenu-wide{
                        width: 1000px;
                        padding: 5px 0 18px;
                        @media only screen and (max-width: 1599px){
                            width: 800px;
                        }
                        @media only screen and (max-width: 1399px){
                            width: 700px;
                        }
                        >li{
                            position: relative;
                            flex: 0 0 25%;
                            .mega-title{
                                position: relative;
                                font-size: 14px;
                                font-weight: 500;
                                padding-left: 35px;
                                ${({ theme }) => (theme.rtl ? 'padding-right' : 'padding-left')}: 45px;
                                color: ${({ theme }) => theme[theme.mainContent]['dark-text']};
                                &:after{
                                    position: absolute;
                                    height: 5px;
                                    width: 5px;
                                    border-radius: 50%;
                                    ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 30px;
                                    top: 50%;
                                    transform: translateY(-50%);
                                    background-color: #C6D0DC;
                                    content: '';
                                }
                            }
                        }
                    }
                    ul{
                        li{
                            position: relative;
                            &:hover{
                                >a{
                                    padding-left: 35px;
                                }
                                &:after{
                                    opacity: 1;
                                    visibility: visible;
                                }
                            }
                            >a{
                                line-height: 3;
                                color: ${({ theme }) => theme[theme.mainContent]['light-text']};
                                font-weight: 400;
                                transition: .3s;
                                &:hover{
                                    color: ${({ theme }) => theme[theme.mainContent]['menu-active']};
                                }
                            }
                            
                            &:after{
                                width: 6px;
                                height: 1px;
                                border-radius: 50%;
                                position: absolute;
                                ${({ theme }) => (theme.rtl ? 'right' : 'left')}: 20px;
                                top: 50%;
                                transform: translateY(-50%);
                                background-color: ${({ theme }) => theme[theme.mainContent]['gray-light-text']};
                                content: '';
                                transition: .3s;
                                opacity: 0;
                                visibility: hidden;
                            }
                        }
                    }
                }
            }
        }
    }
`;

const FooterStyle = Styled(Footer)`
    padding: 20px 30px 18px;    
    font-size: 14px;
    background-color: ${({ theme }) => theme[theme.mainContent]['light-background']};
    width: 100%;
    box-shadow: 0 -5px 10px rgba(146,153,184, 0.05);   
    
    .admin-footer__links{
        margin: 0 -9px;
        text-align: ${({ theme }) => (theme.rtl ? 'left' : 'right')};
        @media only screen and (max-width: 767px){
            text-align: center;
        }
        a {
            margin: 0 9px;
            color: ${({ theme }) => theme[theme.mainContent]['gray-text']};
            &:hover{
                color: ${({ theme }) => theme['primary-color']};
            }
            &:not(:last-child) {
                ${({ theme }) => (theme.rtl ? 'margin-left' : 'margin-right')}: 15px;
            }

            
        }
    }
    
`;

export {
  NavTitle,
  FooterStyle,
  LayoutContainer,
  SmallScreenAuthInfo,
  SmallScreenSearch,
  ModeSwitch,
  TopMenuStyle,
  TopMenuSearch,
};
