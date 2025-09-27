import React from "react";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import Image from "next/image";
import { Container } from "../ui/container";
import { config } from "@/config/config";
import Link from "next/link";

interface Footer {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
}

const defaultSections = [
  {
    title: "Product",
    links: [
      { name: "Overview", href: "/" },
      { name: "Features", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "/about" },
      { name: "Contact", href: "/contact" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", href: "/privacy-policy" },
      { name: "Terms & Conditions", href: "/terms-conditions" },
      { name: "Help", href: "#" },
      { name: "Support", href: "#" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <FaInstagram className='size-5' />, href: "#", label: "Instagram" },
  { icon: <FaFacebook className='size-5' />, href: "#", label: "Facebook" },
  { icon: <FaTwitter className='size-5' />, href: "#", label: "Twitter" },
  { icon: <FaLinkedin className='size-5' />, href: "#", label: "LinkedIn" },
];

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "/terms-conditions" },
  { name: "Privacy Policy", href: "/privacy-policy" },
];

const Footer = ({
  logo = {
    url: config.app.url,
    src: "/logo.png",
    alt: config.app.name,
    title: config.app.shortName,
  },
  sections = defaultSections,
  description = config.app.description,
  socialLinks = defaultSocialLinks,
  copyright = `© ${new Date().getFullYear()} ${
    config.app.name
  }. All rights reserved.`,
  legalLinks = defaultLegalLinks,
}: Footer) => {
  return (
    <section className='border-t pt-10'>
      <Container className=''>
        <div className='flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left'>
          <div className='flex w-full flex-col justify-between gap-6 lg:items-start'>
            {/* Logo */}
            <div className='flex items-center gap-4 lg:justify-start'>
              <Link href={logo.url}>
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.title}
                  className='h-8 w-8'
                  width={32}
                  height={32}
                  priority
                />
              </Link>
              <h2 className='text-xl font-semibold'>{logo.title}</h2>
            </div>
            <p className='text-muted-foreground max-w-[70%] text-sm'>
              {description}
            </p>
            <ul className='text-muted-foreground flex items-center space-x-6'>
              {socialLinks.map((social, idx) => (
                <li key={idx} className='hover:text-primary font-medium'>
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className='grid w-full gap-6 md:grid-cols-3 lg:gap-20'>
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className='mb-4 font-bold'>{section.title}</h3>
                <ul className='text-muted-foreground space-y-3 text-sm'>
                  {section.links.map((link, linkIdx) => (
                    <li
                      key={linkIdx}
                      className='hover:text-primary font-medium'
                    >
                      <Link href={link.href}>{link.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className='text-muted-foreground mt-8 flex flex-col justify-between gap-4 border-t py-8 text-xs font-medium md:flex-row md:items-center md:text-left'>
          <p className='order-2 lg:order-1'>{copyright}</p>
          <ul className='order-1 flex flex-col gap-2 md:order-2 md:flex-row'>
            {legalLinks.map((link, idx) => (
              <li key={idx} className='hover:text-primary'>
                <Link href={link.href}> {link.name}</Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
};

export { Footer };
