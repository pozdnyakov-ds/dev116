export default ({ store, redirect }) => {
  const scope =
    store.state.user && store.state.user.scope ? store.state.user.scope : [];
  if (store.state.loggedIn && scope.includes("admin")) {
    //...
  } else {
    return redirect("/login");
  }
};
