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
import ReactSelect from "react-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CYLINDER_API, VENDOR_API } from "@/constants/apiConstants";
import { useApiMutation } from "@/hooks/use-mutation";
import { useGetApiMutation } from "@/hooks/useGetApiMutation";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const initialState = {
  cylinder_year: new Date().getFullYear().toString(),
  cylinder_date: new Date().toISOString().split("T")[0],
  cylinder_vendor_id: "",
  cylinder_count: 0,
  cylinder_batch_nos: "",
};

const CylinderForm = ({ isOpen, onClose }) => {
  const [data, setData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const { trigger: fetchBatchNo, loading: batchLoading } = useApiMutation();
  const { trigger: submitCylinder, loading: submitLoading } = useApiMutation();
  const queryClient = useQueryClient();

  const { data: vendorData } = useGetApiMutation({
    url: VENDOR_API.dropdown,
    queryKey: ["vendor-dropdown"],
    options: { enabled: isOpen },
  });
  const vendorOptions =
    vendorData?.vendor?.map((vendor) => ({
      value: vendor.id.toString(),
      label: vendor.vendor_name,
    })) || [];

  const selectedOption = vendorOptions.find(
    (option) => option.value === data.cylinder_vendor_id,
  );
  useEffect(() => {
    if (isOpen) {
      setData(initialState);
      setErrors({});
      generateBatchNo();
    }
  }, [isOpen]);

  const generateBatchNo = async () => {
    try {
      const res = await fetchBatchNo({
        url: CYLINDER_API.batchNo,
        method: "get",
      });
      console.log("Batch No Response:", res);

      const latestId = res?.latestid?.cylinder_batch_nos || res?.latestid;
      const nextId =
        isNaN(latestId) || latestId === null
          ? "1001"
          : (Number(latestId) + 1).toString();

      setData((prev) => ({ ...prev, cylinder_batch_nos: nextId }));
    } catch (err) {
      toast.error("Failed to generate batch number");
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!data.cylinder_date) newErrors.cylinder_date = "Required";
    if (!data.cylinder_vendor_id) newErrors.cylinder_vendor_id = "Required";
    if (!data.cylinder_batch_nos) newErrors.cylinder_batch_nos = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const formData = new FormData();
    formData.append("cylinder_year", data.cylinder_year);
    formData.append("cylinder_date", data.cylinder_date);
    formData.append("cylinder_vendor_id", data.cylinder_vendor_id);
    formData.append("cylinder_count", data.cylinder_count);
    formData.append("cylinder_batch_nos", data.cylinder_batch_nos);

    try {
      const res = await submitCylinder({
        url: CYLINDER_API.create,
        method: "post",
        data: formData,
      });

      if (res?.code === 201 || res?.code === 200) {
        toast.success(res?.msg || "Batch created successfully");
        onClose();
        queryClient.invalidateQueries({ queryKey: ["cylinderlist"] });
      } else {
        toast.error(res?.msg || "Failed to create batch");
      }
    } catch (err) {

      toast.error("Operation failed");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* 👇 Responsive dialog: 95% width on mobile, capped on larger screens */}
      <DialogContent
        className="w-[95vw] max-w-md sm:max-w-lg"
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>Create Cylinder</DialogTitle>
        </DialogHeader>

        {(submitLoading || batchLoading) && <LoadingBar />}

        <div className="space-y-4 py-4">
          {/* 👇 Responsive grid: stacks on mobile, side‑by‑side on sm+ */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date *</label>
              <Input
                type="date"
                value={data.cylinder_date}
                onChange={(e) =>
                  setData({ ...data, cylinder_date: e.target.value })
                }
              />
              {errors.cylinder_date && (
                <p className="text-xs text-red-500">{errors.cylinder_date}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">R K Batch No *</label>
              <Input
                value={data.cylinder_batch_nos}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          {/* Vendor dropdown with ReactSelect */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Vendor *</label>
            <ReactSelect
              key={data.cylinder_sub_manufacturer_id} // forces re‑mount
              options={vendorOptions}
              value={selectedOption}
              onChange={(option) => {
                setData({
                  ...data,
                  cylinder_vendor_id: option ? option.value : "",
                });
                if (errors.cylinder_vendor_id) {
                  setErrors((prev) => ({ ...prev, cylinder_vendor_id: "" }));
                }
              }}
              placeholder="Search or select vendor..."
              isClearable
              isSearchable
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: errors.cylinder_vendor_id
                    ? "#ef4444"
                    : base.borderColor,
                  "&:hover": {
                    borderColor: errors.cylinder_vendor_id
                      ? "#ef4444"
                      : base.borderColor,
                  },
                }),
              }}
            />
            {errors.cylinder_vendor_id && (
              <p className="text-xs text-red-500">
                {errors.cylinder_vendor_id}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={submitLoading}>
            Create Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CylinderForm;
