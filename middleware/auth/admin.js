export default function ({ $storage, redirect }) {
  const scope =
    $storage.state.user && $storage.state.user.scope
      ? $storage.state.user.scope
      : [];

  if ($storage.state.loggedIn && scope.includes("admin")) {
    //...
  } else {
    return redirect("/login");
  }
}
