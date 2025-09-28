import Image from "next/image";
import React from "react";

export default function InfoPopup() {
  const aspectImgSize = 15;

  return (
    <div className="absolute w-full bg-white border-2 z-10 flex flex-col gap-1">
      <h2 className="text-lg text-center font-bold border-b-2">Legenda</h2>

      <div className="p-2 flex flex-col gap-1">
        <h2 className="text-sm md:text-[1rem] font-bold">Aspectos:</h2>
        <div className="grid grid-cols-3 text-[1rem]">
          <div className="flex flex-row items-center justify-start">
            <Image
              alt="sextile"
              src="/aspects/sextile.png"
              width={aspectImgSize}
              height={aspectImgSize}
              unoptimized
            />
            <span className="pl-2">Sextil</span>
          </div>

          <div className="flex flex-row items-center justify-start">
            <Image
              alt="sextile"
              src="/aspects/square.png"
              width={aspectImgSize}
              height={aspectImgSize}
              unoptimized
            />
            <span className="pl-2">Quadratura</span>
          </div>

          <div className="flex flex-row items-center justify-end md:justify-start">
            <Image
              alt="sextile"
              src="/aspects/trine.png"
              width={aspectImgSize}
              height={aspectImgSize}
              unoptimized
            />
            <span className="pl-2">Trígono</span>
          </div>

          <div className="flex flex-row items-center justify-start">
            <Image
              alt="sextile"
              src="/aspects/opposition.png"
              width={aspectImgSize}
              height={aspectImgSize}
              unoptimized
            />
            <span className="pl-2">Oposição</span>
          </div>

          <div className="flex flex-row items-center justify-start">
            <Image
              alt="sextile"
              src="/aspects/conjunction.png"
              width={aspectImgSize}
              height={aspectImgSize}
              unoptimized
            />
            <span className="pl-2">Conjunção</span>
          </div>
        </div>
        <h2 className="text-sm md:text-[1rem] font-bold">Elementos:</h2>
        <div>(C): Casa astrológica</div>
        <div>(E): Elementos do mapa externo</div>
        <h2 className="text-sm md:text-[1rem] font-bold">Tipo de aspecto:</h2>
        <div>(A): Aplicativo</div>
        <div>(S): Separativo</div>
      </div>
    </div>
  );
}
