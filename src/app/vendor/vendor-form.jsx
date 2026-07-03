import { GroupButton } from "@/components/group-button";
import LoadingBar from "@/components/loader/loading-bar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VENDOR_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/use-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const initialState = {
  vendor_name: "",
  vendor_mobile: "",
  vendor_email: "",
  vendor_state: "",
  vendor_address: "",
  vendor_status: "Active",
};

const VendorForm = ({ isOpen, onClose, vendorId }) => {
  const isEditMode = Boolean(vendorId);
  const [data, setData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const { trigger: fetchVendor, loading } = useApiMutation();
  const { trigger: submitVendor, loading: submitLoading } = useApiMutation();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isOpen) return;

    if (!isEditMode) {
      setData(initialState);
      setErrors({});
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetchVendor({
          url: VENDOR_API.byId(vendorId),
        });

        console.log("Vendor Detail Response:", res);
        const vendorData = res?.vendor || res?.data;
        if (vendorData) {
          setData({
            vendor_name: vendorData.vendor_name || "",
            vendor_mobile: vendorData.vendor_mobile || "",
            vendor_email: vendorData.vendor_email || "",
            vendor_state: vendorData.vendor_state || "",
            vendor_address: vendorData.vendor_address || "",
            vendor_status: vendorData.vendor_status || "Active",
          });
        }
      } catch (err) {
        toast.error("Failed to load vendor data");
      }
    };

    fetchData();
  }, [isOpen, vendorId]);

  const validate = () => {
    const newErrors = {};

    if (!data.vendor_name.trim()) {
      newErrors.vendor_name = "Required";
    }

    const email = data.vendor_email?.trim();

    if (email && !/^[^\s@]+@gmail\.com$/i.test(email)) {
      newErrors.vendor_email = "Enter a valid Gmail address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append("vendor_name", data.vendor_name);
    formData.append("vendor_mobile", data.vendor_mobile);
    formData.append("vendor_email", data.vendor_email);
    formData.append("vendor_state", data.vendor_state);
    formData.append("vendor_address", data.vendor_address);
    formData.append("vendor_status", data.vendor_status);

    try {
      const res = await submitVendor({
        url: isEditMode ? VENDOR_API.updateById(vendorId) : VENDOR_API.create,
        method: isEditMode ? "put" : "post",
        data: formData,
      });

      if (res?.code === 200 || res?.code === 201) {
        toast.success(res?.msg || "Saved successfully");
        onClose();
        queryClient.invalidateQueries({ queryKey: ["vendorlist"] });
      } else {
        toast.error(res?.msg || "Operation failed");
      }
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* 👇 Responsive dialog width */}
      <DialogContent
        className="w-[95vw] max-w-md sm:max-w-lg"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Vendor" : "Create Vendor"}
          </DialogTitle>
        </DialogHeader>

        {loading && <LoadingBar />}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Vendor Name *</label>
            <Input
              placeholder="Name"
              value={data.vendor_name}
              onChange={(e) =>
                setData({ ...data, vendor_name: e.target.value })
              }
            />
            {errors.vendor_name && (
              <p className="text-xs text-red-500">{errors.vendor_name}</p>
            )}
          </div>

          {/* 👇 Responsive grid: stacks on mobile, two columns on larger screens */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile</label>
              <Input
                placeholder="Mobile"
                value={data.vendor_mobile}
                onChange={(e) =>
                  setData({ ...data, vendor_mobile: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                placeholder="Email"
                type="email"
                value={data.vendor_email}
                onChange={(e) =>
                  setData({ ...data, vendor_email: e.target.value })
                }
              />
              {errors.vendor_email && (
                <p className="text-xs text-red-500">{errors.vendor_email}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">State</label>
            <Input
              placeholder="State"
              value={data.vendor_state}
              onChange={(e) =>
                setData({ ...data, vendor_state: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Textarea
              placeholder="Address"
              value={data.vendor_address}
              onChange={(e) =>
                setData({ ...data, vendor_address: e.target.value })
              }
            />
          </div>

          {isEditMode && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Status </label>
              <GroupButton
                className="w-fit"
                value={data.vendor_status}
                onChange={(value) => setData({ ...data, vendor_status: value })}
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={submitLoading}>
            {isEditMode ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VendorForm;
