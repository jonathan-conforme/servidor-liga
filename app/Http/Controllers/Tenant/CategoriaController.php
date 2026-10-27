<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tenant\Categoria\StoreCategoriaRequest;
use App\Http\Requests\Tenant\Categoria\UpdateCategoriaRequest;
use App\Services\Tenant\CategoriaService;
use App\Models\Tenant\Categoria;
use Inertia\Inertia;

class CategoriaController extends Controller
{
    public function __construct(private CategoriaService $categoriaService) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Tenant/Categorias/Index', [
            'categorias' => $this->categoriaService->index()
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->categoriaService->create($request->validated());


    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoriaRequest $request)
    {
        $this->categoriaService->create($request->validated());

        return back()->with('success', 'Categoría creada exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Categoria $categoria)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Categoria $categoria)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoriaRequest $request, Categoria $categoria)
    {
        $this->categoriaService->update($categoria, $request->validated());

        return back()->with('success', 'Categoría actualizada correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Categoria $categoria)
    {
        $this->categoriaService->delete($categoria);

        return back()->with('success', 'Categoría eliminada.');
    }
}
