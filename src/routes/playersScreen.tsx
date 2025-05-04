import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/playersScreen')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/players"!</div>
}
