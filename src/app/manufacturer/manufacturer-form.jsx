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
import { MANUFACTURER_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/use-mutation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const initialState = {
  manufacturer_name: "",
  manufacturer_mobile: "",
  manufacturer_email: "",
  manufacturer_state: "",
  manufacturer_address: "",
  manufacturer_status: "Active",
};

const ManufacturerForm = ({ isOpen, onClose, manufacturerId }) => {
  const isEditMode = Boolean(manufacturerId);
  const [data, setData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const { trigger: fetchManufacturer, loading } = useApiMutation();
  const { trigger: submitManufacturer, loading: submitLoading } =
    useApiMutation();
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
        const res = await fetchManufacturer({
          url: MANUFACTURER_API.byId(manufacturerId),
        });

        console.log("Manufacturer Detail Response:", res);
        const manufacturerData = res?.manufacturer || res?.data;
        if (manufacturerData) {
          setData({
            manufacturer_name: manufacturerData.manufacturer_name || "",
            manufacturer_mobile: manufacturerData.manufacturer_mobile || "",
            manufacturer_email: manufacturerData.manufacturer_email || "",
            manufacturer_state: manufacturerData.manufacturer_state || "",
            manufacturer_address: manufacturerData.manufacturer_address || "",
            manufacturer_status:
              manufacturerData.manufacturer_status || "Active",
          });
        }
      } catch (err) {
        toast.error("Failed to load manufacturer data");
      }
    };

    fetchData();
  }, [isOpen, manufacturerId]);

  const validate = () => {
    const newErrors = {};

    if (!data.manufacturer_name.trim()) {
      newErrors.manufacturer_name = "Required";
    }

    const email = data.manufacturer_email?.trim();

    if (email && !/^[^\s@]+@gmail\.com$/i.test(email)) {
      newErrors.manufacturer_email = "Enter a valid Gmail address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append("manufacturer_name", data.manufacturer_name);
    formData.append("manufacturer_mobile", data.manufacturer_mobile);
    formData.append("manufacturer_email", data.manufacturer_email);
    formData.append("manufacturer_state", data.manufacturer_state);
    formData.append("manufacturer_address", data.manufacturer_address);
    formData.append("manufacturer_status", data.manufacturer_status);

    try {
      const res = await submitManufacturer({
        url: isEditMode
          ? MANUFACTURER_API.updateById(manufacturerId)
          : MANUFACTURER_API.create,
        method: isEditMode ? "put" : "post",
        data: formData,
      });

      if (res?.code === 200 || res?.code === 201) {
        toast.success(res?.msg || "Saved successfully");
        onClose();
        queryClient.invalidateQueries({ queryKey: ["manufacturerlist"] });
      } else {
        toast.error(res?.msg || "Operation failed");
      }
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] max-w-md sm:max-w-lg"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Manufacturer" : "Create Manufacturer"}
          </DialogTitle>
        </DialogHeader>

        {loading && <LoadingBar />}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Manufacturer Name *</label>
            <Input
              placeholder="Name"
              value={data.manufacturer_name}
              onChange={(e) =>
                setData({ ...data, manufacturer_name: e.target.value })
              }
            />
            {errors.manufacturer_name && (
              <p className="text-xs text-red-500">{errors.manufacturer_name}</p>
            )}
          </div>

          {/* Responsive grid: stacks on mobile, side‑by‑side on larger screens */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile</label>
              <Input
                placeholder="Mobile"
                value={data.manufacturer_mobile}
                onChange={(e) =>
                  setData({ ...data, manufacturer_mobile: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                placeholder="Email"
                type="email"
                value={data.manufacturer_email}
                onChange={(e) =>
                  setData({ ...data, manufacturer_email: e.target.value })
                }
              />
              {errors.manufacturer_email && (
                <p className="text-xs text-red-500">
                  {errors.manufacturer_email}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">State</label>
            <Input
              placeholder="State"
              value={data.manufacturer_state}
              onChange={(e) =>
                setData({ ...data, manufacturer_state: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Textarea
              placeholder="Address"
              value={data.manufacturer_address}
              onChange={(e) =>
                setData({ ...data, manufacturer_address: e.target.value })
              }
              className="h-24 resize-none overflow-y-scroll"
            />
          </div>

          {isEditMode && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Status *</label>
              <GroupButton
                className="w-fit"
                value={data.manufacturer_status}
                onChange={(value) =>
                  setData({ ...data, manufacturer_status: value })
                }
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
              />
            </div>
          )}
        </div>

        {/* 👇 Footer: force buttons to stay on the same line */}
        <DialogFooter className="flex flex-row justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="whitespace-nowrap"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={submitLoading}
            className="whitespace-nowrap"
          >
            {isEditMode ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManufacturerForm;
