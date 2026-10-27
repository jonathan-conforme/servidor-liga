import AdminLayout from "@/Layouts/AdminLayout";
import { useForm } from "@inertiajs/react";

export default function Edit({
    pago,
    suscripciones
}) {

    const { data, setData, put, processing } =
        useForm({

            suscripcion_id:
                pago.suscripcion_id,

            monto:
                pago.monto,

            referencia:
                pago.referencia ?? "",

            fecha_pago:
                pago.fecha_pago,

            metodo_pago:
                pago.metodo_pago,

            estado:
                pago.estado,

            observacion:
                pago.observacion ?? ""

        });

    const submit = (e) => {

        e.preventDefault();

        put(
            route(
                "superadmin.pagos.update",
                pago.id
            )
        );
    };

    return (
        <AdminLayout>

            <h1 className="text-2xl font-bold mb-6">
                Editar Pago
            </h1>

            <form
                onSubmit={submit}
                className="space-y-5 bg-white p-6 rounded-xl border"
            >

                <div>

                    <label>Suscripción</label>

                    <select
                        className="w-full border rounded-lg"
                        value={data.suscripcion_id}
                        onChange={(e) =>
                            setData(
                                "suscripcion_id",
                                e.target.value
                            )
                        }
                    >

                        {suscripciones.map((s) => (

                            <option
                                key={s.id}
                                value={s.id}
                            >
                                {s.tenant.nombre}
                                {" - "}
                                {s.plan.nombre}
                            </option>

                        ))}

                    </select>

                </div>

                <div>

                    <label>Monto</label>

                    <input
                        type="number"
                        step="0.01"
                        className="w-full border rounded-lg"
                        value={data.monto}
                        onChange={(e) =>
                            setData(
                                "monto",
                                e.target.value
                            )
                        }
                    />

                </div>

                <div>

                    <label>Referencia</label>

                    <input
                        className="w-full border rounded-lg"
                        value={data.referencia}
                        onChange={(e) =>
                            setData(
                                "referencia",
                                e.target.value
                            )
                        }
                    />

                </div>

                <div>

                    <label>Estado</label>

                    <select
                        className="w-full border rounded-lg"
                        value={data.estado}
                        onChange={(e) =>
                            setData(
                                "estado",
                                e.target.value
                            )
                        }
                    >

                        <option value="PAGADO">
                            Pagado
                        </option>

                        <option value="PENDIENTE">
                            Pendiente
                        </option>

                        <option value="ANULADO">
                            Anulado
                        </option>

                    </select>

                </div>

                <div>

                    <label>Observación</label>

                    <textarea
                        rows="4"
                        className="w-full border rounded-lg"
                        value={data.observacion}
                        onChange={(e) =>
                            setData(
                                "observacion",
                                e.target.value
                            )
                        }
                    />

                </div>

                <button
                    disabled={processing}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl"
                >
                    Actualizar
                </button>

            </form>

        </AdminLayout>
    );
}
