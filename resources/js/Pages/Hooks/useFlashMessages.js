import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import Swal from "sweetalert2";

export default function useFlashMessages() {
    const { flash } = usePage().props;

    useEffect(() => {

        if (flash?.success) {
            Swal.fire({
                icon: "success",
                title: "Éxito",
                text: flash.success,
                timer: 2500,
                showConfirmButton: false,
            });
        }

        if (flash?.error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: flash.error,
            });
        }

        if (flash?.warning) {
            Swal.fire({
                icon: "warning",
                title: "Advertencia",
                text: flash.warning,
            });
        }

    }, [flash]);
}
