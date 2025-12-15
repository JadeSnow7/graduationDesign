from __future__ import annotations

import base64
import io
from typing import Annotated

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

matplotlib.use("Agg")

app = FastAPI(title="Simulation Service", version="0.1.0")


class Laplace2DRequest(BaseModel):
    nx: Annotated[int, Field(ge=10, le=200)] = 60
    ny: Annotated[int, Field(ge=10, le=200)] = 40
    v_top: float = 1.0
    v_bottom: float = 0.0
    v_left: float = 0.0
    v_right: float = 0.0
    max_iter: Annotated[int, Field(ge=1, le=20000)] = 2000
    tolerance: Annotated[float, Field(gt=0, le=1e-1)] = 1e-5


class Laplace2DResponse(BaseModel):
    png_base64: str
    min_v: float
    max_v: float
    iter: int


@app.get("/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/v1/sim/laplace2d", response_model=Laplace2DResponse)
def laplace2d(req: Laplace2DRequest) -> Laplace2DResponse:
    try:
        v = np.zeros((req.ny, req.nx), dtype=np.float64)
        v[0, :] = req.v_top
        v[-1, :] = req.v_bottom
        v[:, 0] = req.v_left
        v[:, -1] = req.v_right

        it = 0
        for it in range(1, req.max_iter + 1):
            old = v.copy()
            v[1:-1, 1:-1] = 0.25 * (
                v[1:-1, 2:] + v[1:-1, :-2] + v[2:, 1:-1] + v[:-2, 1:-1]
            )
            diff = np.max(np.abs(v - old))
            if diff < req.tolerance:
                break

        vmin = float(np.min(v))
        vmax = float(np.max(v))

        fig = plt.figure(figsize=(6, 3.5), dpi=150)
        ax = fig.add_subplot(111)
        im = ax.imshow(v, origin="upper", cmap="viridis", aspect="auto")
        ax.set_title("2D Laplace Potential (Dirichlet BC)")
        ax.set_xlabel("x")
        ax.set_ylabel("y")
        fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04, label="V")
        fig.tight_layout()

        buf = io.BytesIO()
        fig.savefig(buf, format="png")
        plt.close(fig)
        png_b64 = base64.b64encode(buf.getvalue()).decode("ascii")
        return Laplace2DResponse(png_base64=png_b64, min_v=vmin, max_v=vmax, iter=it)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=str(e)) from e

