import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Drawer, Button } from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  TeamOutlined,
  DashboardOutlined,
  MenuOutlined,
} from "@ant-design/icons";

const { Sider, Content, Header } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const menuItems = [
    {
      key: "/rfps",
      icon: <DashboardOutlined />,
      label: "RFPs",
    },
    {
      key: "/rfps/create",
      icon: <PlusOutlined />,
      label: "Create RFP",
    },
    {
      key: "/vendors",
      icon: <TeamOutlined />,
      label: "Vendors",
    },
  ];

  const handleMenuClick = ({ key }) => {
    navigate(key);
    if (isMobile) {
      setDrawerVisible(false);
    }
  };

  const menuContent = (
    <>
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #f0f0f0",
          fontWeight: "bold",
          fontSize: "18px",
        }}
      >
        RFP System
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 0, height: "calc(100vh - 64px)" }}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {!isMobile ? (
        <Sider
          theme="light"
          width={200}
          style={{
            boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
          }}
        >
          {menuContent}
        </Sider>
      ) : (
        <>
          <Header
            style={{
              background: "#fff",
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              position: "sticky",
              top: 0,
              zIndex: 100,
            }}
          >
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerVisible(true)}
              style={{ fontSize: "18px" }}
            />
            <div
              style={{
                marginLeft: 16,
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              RFP System
            </div>
          </Header>
          <Drawer
            title="Menu"
            placement="left"
            onClose={() => setDrawerVisible(false)}
            open={drawerVisible}
            styles={{ body: { padding: 0 } }}
            width={200}
          >
            <Menu
              mode="inline"
              selectedKeys={[location.pathname]}
              items={menuItems}
              onClick={handleMenuClick}
              style={{ borderRight: 0 }}
            />
          </Drawer>
        </>
      )}
      <Layout>
        <Content
          style={{
            margin: isMobile ? "12px" : "24px",
            padding: isMobile ? "16px" : "24px",
            background: "#fff",
            minHeight: 280,
            borderRadius: "8px",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
