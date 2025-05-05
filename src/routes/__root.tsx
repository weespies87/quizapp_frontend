import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";


export const Route = createRootRoute({
  component: () => (
    <div className="app">
      <main>
        <Outlet />
      </main>
      <footer>
        <p>© 2025 Quiz App</p>
      </footer>
      {/* Only show devtools in development
      {import.meta.env.DEV && <TanStackRouterDevtools />} */}
    </div>
  ),
});
