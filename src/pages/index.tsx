import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import {useState, useEffect} from 'react';

import styles from './index.module.css';

function AnimatedCounter({ end, duration = 2000, suffix = '' }: { end: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner, 'hero-custom')} style={{ padding: '2rem 0' }}>
      <div className="container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src="/Documentation/img/nhm_navbar_logo.svg" 
            alt="Stadt Zürich - Nachhaltigkeitsmonitoring"
            style={{ height: '80px' }}
          />
        </div>
      </div>
    </header>
  );
}

function FeatureCard({ 
  title, 
  description, 
  link, 
  icon, 
  gradient 
}: { 
  title: string; 
  description: string; 
  link: string; 
  icon: string;
  gradient: string;
}) {
  return (
    <div className="col col--4">
      <Link 
        to={link} 
        style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="feature-card" style={{ 
          padding: '2.5rem', 
          borderRadius: '16px', 
          background: gradient,
          color: 'white',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          cursor: 'pointer',
          textDecoration: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
        }}>
          <div style={{ 
            position: 'absolute', 
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url(\'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="cardgrid" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23cardgrid)"/></svg>\')',
            opacity: 0.6
          }}></div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', position: 'relative', zIndex: 1 }}>
            {title}
          </h3>
          <p style={{ marginBottom: '2rem', position: 'relative', zIndex: 1, opacity: 0.9 }}>
            {description}
          </p>
          <div 
            className="button button--outline"
            style={{ 
              borderColor: 'white', 
              color: 'white',
              position: 'relative',
              zIndex: 1,
              display: 'inline-block',
              pointerEvents: 'none'
            }}>
            Mehr erfahren →
          </div>
        </div>
      </Link>
    </div>
  );
}

function ProcessFlow() {
  const steps = [
    { title: 'IFC Upload', description: 'Modell hochladen', icon: '📤' },
    { title: 'Mengen', description: 'Automatische Extraktion', icon: '📊' },
    { title: 'Kosten', description: 'Kennwerte anwenden', icon: '💰' },
    { title: 'LCA', description: 'Ökobilanz berechnen', icon: '🌱' },
    { title: 'Dashboard', description: 'Ergebnisse visualisieren', icon: '📈' }
  ];

  return (
    <section style={{ padding: '2.5rem 0', backgroundColor: 'var(--ifm-color-gray-100)' }}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            Automatisierter Workflow
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--ifm-color-gray-600)', marginBottom: '1.5rem' }}>
            Von IFC-Modellen zu Nachhaltigkeitsbewertungen in 5 Schritten
          </p>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem'
        }}>
          {steps.map((step, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', flex: '1', minWidth: '200px' }}>
              <div style={{
                background: 'linear-gradient(135deg, hsl(244, 94%, 32%), hsl(205, 100%, 64%))',
                borderRadius: '50%',
                width: '80px',
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                color: 'white',
                boxShadow: '0 4px 16px rgba(30, 58, 138, 0.3)'
              }}>
                {step.icon}
              </div>
              <div style={{ marginLeft: '1rem', flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{step.title}</h4>
                <p style={{ margin: 0, color: 'var(--ifm-color-gray-600)', fontSize: '0.9rem' }}>
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div style={{ 
                  fontSize: '1.5rem', 
                  color: 'var(--ifm-color-primary)',
                  marginLeft: '1rem'
                }}>
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout>
      <Head>
        <link rel="icon" href="/Documentation/img/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/Documentation/img/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/Documentation/img/apple-touch-icon.png" />
        <link rel="mask-icon" href="/Documentation/img/safari-pinned-tab.svg" color="#1e3a8a" />
        <link rel="manifest" href="/Documentation/site.webmanifest" />
        <meta name="theme-color" content="#1e3a8a" />
        <meta name="msapplication-TileColor" content="#1e3a8a" />
        <meta name="msapplication-config" content="/Documentation/browserconfig.xml" />
      </Head>
      <HomepageHeader />
      <ProcessFlow />
      <main>
        <section style={{ padding: '2.5rem 0' }}>
          <div className="container">
            <div className="text--center" style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                Dokumentation
              </h2>
            </div>
            <div className="row">
              <FeatureCard
                title="Mengen, Kosten & LCA"
                description="Plugin-Suite für Mengenermittlung, Kostenberechnung und Ökobilanzierung aus IFC-Modellen."
                link="/mengen-kosten-lca/overview"
                icon=""
                gradient="hsl(244, 94%, 32%)"
              />
              <FeatureCard
                title="Dashboard"
                description="Visualisierung und Aggregation der Mengen-, Kosten- und Ökobilanz-Berechnungen für Projektleitende."
                link="/dashboard/overview"
                icon=""
                gradient="hsl(54, 100%, 47%)"
              />
              <FeatureCard
                title="Infrastructure & Core"
                description="IFC Uploader, Projekt Manager und Plugin Manager für die Systemarchitektur."
                link="/infrastructure-team/overview"
                icon=""
                gradient="hsl(205, 100%, 64%)"
              />
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}