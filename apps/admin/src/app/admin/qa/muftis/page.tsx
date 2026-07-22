import { getMuftis } from "@/server/actions/mufti.actions";
import AdminMuftis from "@/components/admin/AdminMuftis";

export const metadata = {
  title: "Admin - Muftis | Amar Talim",
};

export default async function MuftisPage() {
  const res = await getMuftis();
  const muftis = res.ok && res.data ? res.data : [];

  return <AdminMuftis initialMuftis={muftis} />;
}
