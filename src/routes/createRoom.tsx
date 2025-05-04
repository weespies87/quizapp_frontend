import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/createRoom')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/create"!</div>
}
