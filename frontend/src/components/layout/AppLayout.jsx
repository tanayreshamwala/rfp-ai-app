import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu } from "antd";
import {
  FileTextOutlined,
  PlusOutlined,
  TeamOutlined,
  DashboardOutlined,
} from "@ant-design/icons";

const { Sider, Content } = Layout;

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        theme="light"
        width={200}
        style={{
          boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
        }}
      >
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
      </Sider>
      <Layout>
        <Content
          style={{
            margin: "24px",
            padding: "24px",
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
