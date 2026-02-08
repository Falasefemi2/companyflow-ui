"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getRolePermissions, setRolePermissions } from "@/lib/api";
import { Permission, CreatePermissionRequest } from "@/lib/types";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowLeft, PlusCircle, Trash2 } from "lucide-react";
import Link from "next/link";

type PermissionsEditorProps = {
  roleId: string;
};

export function PermissionsEditor({ roleId }: PermissionsEditorProps) {
  const queryClient = useQueryClient();

  const { data: permissions, isLoading } = useQuery<Permission[]>({
    queryKey: ["permissions", roleId],
    queryFn: () => getRolePermissions(roleId),
    enabled: !!roleId,
  });

  const [localPermissions, setLocalPermissions] = React.useState<
    CreatePermissionRequest[]
  >([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (permissions) {
      setLocalPermissions(
        permissions.map(({ action, resource, conditions }) => ({
          action,
          resource,
          conditions,
        })),
      );
    }
  }, [permissions]);

  const setPermissionsMutation = useMutation({
    mutationFn: (newPermissions: CreatePermissionRequest[]) =>
      setRolePermissions(roleId, newPermissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions", roleId] });
      toast.success("Permissions updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update permissions: ${error.message}`);
    },
  });

  const handleSave = () => {
    setPermissionsMutation.mutate(localPermissions);
  };

  const handleAddPermission = (newPermission: CreatePermissionRequest) => {
    setLocalPermissions([...localPermissions, newPermission]);
  };

  const handleRemovePermission = (index: number) => {
    setLocalPermissions(localPermissions.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return <div>Loading permissions...</div>;
  }

  return (
    <div className="space-y-4">
      <Link
        href="/roles"
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/60 text-muted-foreground transition hover:text-foreground hover:border-border"
        aria-label="Back to dashboard"
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Permissions</h3>
        <div className="space-x-2">
          <AddPermissionDialog
            onAdd={handleAddPermission}
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
          />
          <Button
            onClick={handleSave}
            disabled={setPermissionsMutation.isPending}
          >
            {setPermissionsMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Conditions</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localPermissions.length > 0 ? (
              localPermissions.map((permission, index) => (
                <TableRow key={index}>
                  <TableCell>{permission.action}</TableCell>
                  <TableCell>{permission.resource}</TableCell>
                  <TableCell>
                    {permission.conditions
                      ? JSON.stringify(permission.conditions)
                      : "None"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePermission(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No permissions added.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function AddPermissionDialog({
  onAdd,
  open,
  onOpenChange,
}: {
  onAdd: (p: CreatePermissionRequest) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [action, setAction] = React.useState("");
  const [resource, setResource] = React.useState("");
  const [conditions, setConditions] = React.useState("");

  const handleAdd = () => {
    if (!action || !resource) {
      toast.error("Action and Resource are required.");
      return;
    }
    let parsedConditions: Record<string, unknown> | undefined;
    if (conditions) {
      try {
        parsedConditions = JSON.parse(conditions);
      } catch (error) {
        toast.error("Invalid JSON for conditions.");
        return;
      }
    }
    onAdd({ action, resource, conditions: parsedConditions });
    setAction("");
    setResource("");
    setConditions("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Permission
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Add Permission</DialogTitle>
          <DialogDescription>
            Add a new permission to this role. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="action" className="text-right">
              Action
            </Label>
            <Input
              id="action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="col-span-3"
              placeholder="e.g., read, write"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="resource" className="text-right">
              Resource
            </Label>
            <Input
              id="resource"
              value={resource}
              onChange={(e) => setResource(e.target.value)}
              className="col-span-3"
              placeholder="e.g., users, roles"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="conditions" className="text-right">
              Conditions (JSON)
            </Label>
            <Input
              id="conditions"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              className="col-span-3"
              placeholder='e.g., {"department":"finance"}'
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAdd}>Add Permission</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
