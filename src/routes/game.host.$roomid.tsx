import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/game/host/$roomId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/game/host/$roomid"!</div>
}
