import PageHeader, { Page } from '@/components/PageHeader'
import { Button, Empty } from '@/components/ui'

export default function NotFound() {
  return (
    <>
      <PageHeader title="Not found" />
      <Page>
        <Empty title="This page doesn’t exist" action={<Button href="/checklist">Go to checklist</Button>}>
          Check the address, or use the tabs below.
        </Empty>
      </Page>
    </>
  )
}
