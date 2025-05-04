import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"


export const Route = createRootRoute({
  component: () => (
    <div className="app">
      <header className="app-header">
        <h1>Quiz Game</h1>
        <Menubar>
          <MenubarMenu>
            <MenubarTrigger>Game Setup</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <Link to="/createRoom" activeProps={{ className: "active" }}>
                  Create Room
                </Link>
                <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                <Link to="/playersScreen" activeProps={{ className: "active" }}>
                  Join Room
                </Link>
                <MenubarShortcut>⌘J</MenubarShortcut>
              </MenubarItem>
              <MenubarSeparator />
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Player Menu</MenubarTrigger>
            <MenubarContent>
              <MenubarItem>
                <Link to="/playersScreen" activeProps={{ className: "active" }}>
                  Player List
                </Link>
                <MenubarShortcut>⌘P</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Room Menu</MenubarTrigger>
            <MenubarContent>
              {/* Room menu items go here */}
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <p>© 2025 Quiz App</p>
      </footer>
      {/* Only show devtools in development */}
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </div>
  ),
});
