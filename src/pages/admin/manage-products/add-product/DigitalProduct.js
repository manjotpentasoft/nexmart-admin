import AdminLayout from "../../../../components/AdminLayout";
import ProductForm from "./ProductForm";

export default function CreateDigitalProduct() {
  return (
    <AdminLayout>
      <ProductForm key="digital" productType="digital" />
    </AdminLayout>
  );
}
