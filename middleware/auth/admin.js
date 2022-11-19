export default function ({ $auth, $storage, redirect }) {
  const scope = $auth.user && $auth.user.scope ? $auth.user.scope : [];

  if ($auth.loggedIn && scope.includes("admin")) {
    // if (!$auth.hasScope("admin")) {
    //...
  } else {
    return redirect("/login");
  }
}
