import AdminLayout from "../../../../components/AdminLayout";
import ProductForm from "./CreateProduct";

export default function CreatePhysicalProduct() {
  return (
    <AdminLayout>
      <ProductForm productType="physical" />
    </AdminLayout>
  );
}
