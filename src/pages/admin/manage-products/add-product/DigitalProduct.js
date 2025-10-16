import AdminLayout from "../../../../components/AdminLayout";
import ProductForm from "./CreateProduct";

export default function CreateDigitalProduct() {
  return (
    <AdminLayout>
      <ProductForm productType="digital" />
    </AdminLayout>
  );
}
