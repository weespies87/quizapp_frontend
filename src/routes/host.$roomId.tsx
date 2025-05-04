import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/host/$roomId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/host/$roomId"!</div>
}
