import ProductDetailPage from "@/app/(shell)/pages/product-detail"

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProductDetailPage sku={id} />
}
