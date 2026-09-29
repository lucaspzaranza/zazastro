// src/app/components/menus/MenuContainer.tsx
"use client";
import Image from "next/image";
import Link from "next/link";
import Container from "@/app/components/Container";
import Spinner from "@/app/components/Spinner";
import { useTranslations } from "next-intl";
import { useScreenDimensions } from "@/contexts/ScreenDimensionsContext";

interface MenuContainerProps {
  titleKey: string;
  mobileTitleKey?: string;
  loading?: boolean;
  children: React.ReactNode | ((iconSize: number) => React.ReactNode);
}

const ICON_SIZE = 22;

export default function MenuContainer({ titleKey, mobileTitleKey, loading = false, children }: MenuContainerProps) {
  const t = useTranslations();
  const { isMobileBreakPoint } = useScreenDimensions();
  const title = isMobileBreakPoint() && mobileTitleKey ? t(mobileTitleKey) : t(titleKey);

  return (
    <Container className="w-[90%] sm:w-1/4">
        <div className="w-full p-4 sm:p-0 flex flex-col gap-3">
					<h2 className="text-[1rem] sm:text-lg self-center sm:text-start pt-4 px-2 sm:pt-0 sm:mb-1 font-bold">
						{title}
					</h2>

					{typeof children === "function" ? children(ICON_SIZE) : children}

					<Link href="/" className="default-btn">
						{t("form.back")}
						<Image src="/back.png" width={ICON_SIZE} height={ICON_SIZE} unoptimized alt="chart" />
					</Link>

					<span
						className={`w-full text-start flex flex-row items-center justify-center gap-3 mt-2 ${loading ? "opacity-100" : "opacity-0"}`}
					>
						<Spinner />
						<span>{t("home.loading")}</span>
					</span>
        </div>
    </Container>
  );
}