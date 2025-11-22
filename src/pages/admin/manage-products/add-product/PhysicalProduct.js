import AdminLayout from "../../../../components/AdminLayout";
import ProductForm from "./ProductForm";

export default function CreatePhysicalProduct() {
  return (
    <AdminLayout>
      <ProductForm key="physical" productType="physical" />
    </AdminLayout>
  );
}
