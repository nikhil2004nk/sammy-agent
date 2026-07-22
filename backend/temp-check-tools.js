async function check() {
  const response = await fetch('http://localhost:3001/workspaces/39eda5e6-e824-493f-90c9-dfef4b2cb43f/mcp/servers');
  const servers = await response.json();
  console.log('Servers:', servers);
}
check();
