/* GoGO Pantry — Staff app root */
function StaffApp() {
  const [shopId, setShopId] = useState(null);
  const [route, setRoute] = useState("dashboard");

  if (!shopId) return <StaffLogin onLogin={(s) => { setShopId(s); setRoute("dashboard"); }} />;

  const screens = {
    dashboard: <DashboardScreen shopId={shopId} setRoute={setRoute} />,
    fulfill: <FulfillScreen shopId={shopId} setRoute={setRoute} />,
    receive: <ReceiveScreen shopId={shopId} setRoute={setRoute} />,
    transfer: <TransferScreen shopId={shopId} setRoute={setRoute} />,
  };

  return (
    <Shell shopId={shopId} route={route} setRoute={setRoute} onLogout={() => setShopId(null)}>
      <div key={route}>{screens[route]}</div>
    </Shell>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<StaffApp />);
