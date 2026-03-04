"use client";

import { Smartphone, Download, Star, Shield, Zap, QrCode } from "lucide-react";
import { useTranslations } from "next-intl";

export function AppDownloadSection() {
  const t = useTranslations("AppDownload");

  return (
    <section className="from-primary via-primary-hover relative overflow-hidden bg-gradient-to-br to-blue-700 py-16 md:py-20">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-white blur-3xl" />
        <div className="absolute right-10 bottom-10 h-96 w-96 rounded-full bg-white blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          {/* Left Content */}
          <div className="text-white">
            <span className="mb-6 inline-block rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
              {t("label")}
            </span>
            <h2 className="mb-4 text-3xl leading-tight font-bold md:text-4xl lg:text-5xl">
              {t("title")}
            </h2>
            <p className="text-primary-lighter mb-8 text-lg leading-relaxed md:text-xl">
              {t("description")}
            </p>

            {/* Features List */}
            <div className="mb-8 space-y-4">
              <FeatureItem
                icon={Zap}
                title={t("features.fast.title")}
                description={t("features.fast.desc")}
              />
              <FeatureItem
                icon={Shield}
                title={t("features.secure.title")}
                description={t("features.secure.desc")}
              />
              <FeatureItem
                icon={Star}
                title={t("features.rating.title")}
                description={t("features.rating.desc")}
              />
            </div>

            {/* Download Buttons */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="#download-playstore"
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 font-semibold text-slate-800 shadow-lg transition-all duration-300 hover:bg-slate-50 hover:shadow-xl"
              >
                <svg
                  className="h-8 w-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-slate-600">
                    {t("downloadAt")}
                  </div>
                  <div className="font-bold">Google Play</div>
                </div>
              </a>

              <a
                href="#download-appstore"
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-white px-6 py-4 font-semibold text-slate-800 shadow-lg transition-all duration-300 hover:bg-slate-50 hover:shadow-xl"
              >
                <svg
                  className="h-8 w-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-slate-600">
                    {t("downloadAt")}
                  </div>
                  <div className="font-bold">App Store</div>
                </div>
              </a>
            </div>

            {/* QR Code */}
            <div className="inline-flex items-center gap-4 rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-white p-2">
                <QrCode size={64} className="text-slate-800" />
              </div>
              <div className="text-sm">
                <p className="mb-1 font-semibold">{t("qrTitle")}</p>
                <p className="text-primary-light">{t("qrDesc")}</p>
              </div>
            </div>
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="relative lg:scale-110">
            <div className="relative mx-auto w-full max-w-sm">
              {/* Floating Elements */}
              <div className="absolute -top-10 -right-10 h-24 w-24 animate-bounce rounded-2xl border border-white/30 bg-white/20 p-4 shadow-xl backdrop-blur-sm">
                <Download size={40} className="text-white" />
                <p className="mt-2 text-xs font-semibold text-white">
                  100K+ Download
                </p>
              </div>

              <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-2xl border border-white/30 bg-white/20 p-4 shadow-xl backdrop-blur-sm">
                <Star size={40} className="fill-white text-white" />
                <p className="mt-2 text-xs font-semibold text-white">
                  Rating 4.8
                </p>
              </div>

              {/* Phone Frame */}
              <div className="relative rounded-[3rem] bg-white p-3 shadow-2xl">
                <div className="from-primary-lighter overflow-hidden rounded-[2.5rem] bg-gradient-to-br to-blue-50">
                  {/* Notch */}
                  <div className="mx-auto mb-4 h-6 w-40 rounded-b-3xl bg-white" />

                  {/* Screen Content */}
                  <div className="space-y-4 px-6 pb-6">
                    {/* App Header */}
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-xl">
                          <span className="text-xl font-bold text-white">
                            N
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">
                            Super App
                          </h3>
                          <p className="text-xs text-slate-500">Kab. Naiera</p>
                        </div>
                      </div>
                      <Smartphone size={24} className="text-primary" />
                    </div>

                    {/* Quick Services */}
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        "E-KTP",
                        "BPJS",
                        "Pajak",
                        "Sekolah",
                        "Izin",
                        "Aduan",
                      ].map((service, i) => (
                        <div
                          key={i}
                          className="rounded-xl bg-white p-3 text-center shadow-sm"
                        >
                          <div className="bg-primary-light mx-auto mb-2 h-10 w-10 rounded-lg" />
                          <p className="text-xs font-medium text-slate-700">
                            {service}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Banner */}
                    <div className="from-primary rounded-xl bg-gradient-to-r to-blue-500 p-4 text-white">
                      <p className="text-sm font-semibold">
                        {t("banner.services")}
                      </p>
                      <p className="text-xs opacity-90">{t("banner.praise")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface FeatureItemProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

function FeatureItem({ icon: Icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <h4 className="mb-1 font-semibold">{title}</h4>
        <p className="text-primary-light text-sm">{description}</p>
      </div>
    </div>
  );
}
