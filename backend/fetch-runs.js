async function main() {
  try {
    const res = await fetch('http://localhost:3001/conversations/e3ddefaf-3e17-4834-86dc-dd43d0eb0ddd/runs');
    console.log(res.status);
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  }
}
main();
