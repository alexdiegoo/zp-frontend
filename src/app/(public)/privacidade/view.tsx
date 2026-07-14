import { LandingHeader } from "@/components/landing/landing-header";
import { LandingFooter } from "@/components/landing/landing-footer";

import { PolicySection } from "./_components/policy-section";
import { POLICY_METADATA } from "./_content";

/**
 * Public privacy policy page.
 *
 * Server Component (no "use client"): 100% static legal copy with no interactivity,
 * so the full text is present in the server-rendered HTML — reachable by an anonymous
 * visitor or an automated crawler (e.g. a Meta app reviewer). Reuses the public
 * landing chrome for consistent navigation and branding.
 */
export function PrivacyPolicyView() {
  const { controller, contactChannel, effectiveDate, dataDeletion } = POLICY_METADATA;

  return (
    <>
      <LandingHeader />

      <main className="flex-1">
        <article className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
          <header>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Política de Privacidade
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Última atualização: {effectiveDate}
            </p>
          </header>

          <div className="mt-12 space-y-12">
            <PolicySection id="introducao" title="1. Introdução">
              <p>
                Esta Política de Privacidade descreve como o {controller}{" "}
                (&ldquo;ZapBlast&rdquo;, &ldquo;nós&rdquo;) coleta, utiliza, compartilha e
                protege os dados pessoais tratados por meio da plataforma ZapBlast — um CRM
                para clínicas que também realiza o disparo de campanhas de WhatsApp em
                escala. Ela se aplica a clínicas usuárias, à sua equipe e aos contatos
                (leads e pacientes) cujos dados são tratados na plataforma.
              </p>
              <p>
                O tratamento de dados observa a Lei Geral de Proteção de Dados Pessoais
                (Lei nº 13.709/2018 — &ldquo;LGPD&rdquo;). Ao utilizar a plataforma, você
                declara estar ciente das práticas descritas aqui.
              </p>
            </PolicySection>

            <PolicySection id="dados-coletados" title="2. Dados que coletamos">
              <p>Tratamos as seguintes categorias de dados pessoais e suas finalidades:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="font-medium text-foreground">
                    Dados de identificação e contato
                  </span>{" "}
                  (nome, número de telefone/WhatsApp, e-mail) — para identificar o contato e
                  permitir a comunicação.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Dados da conta da clínica
                  </span>{" "}
                  (dados de cadastro e credenciais da equipe usuária) — para autenticação e
                  operação da plataforma.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Dados de jornada do paciente
                  </span>{" "}
                  (estágio no funil, agendamentos, procedimentos) — para gerir e otimizar o
                  atendimento.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Dados de campanhas e mensagens
                  </span>{" "}
                  (conteúdo enviado, status de entrega e interações) — para operar, medir e
                  otimizar as campanhas de WhatsApp.
                </li>
              </ul>
            </PolicySection>

            <PolicySection id="uso-dos-dados" title="3. Como usamos os dados">
              <p>Utilizamos os dados pessoais para as seguintes finalidades:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Operar o CRM e acompanhar a jornada de leads e pacientes.</li>
                <li>
                  Disparar campanhas de WhatsApp — inclusive por meio da API oficial do
                  WhatsApp (WhatsApp Cloud API), disponibilizada pela Meta — respeitando
                  regras de <em>opt-in</em>, modelos de mensagem aprovados e a janela de
                  atendimento de 24 horas quando aplicável.
                </li>
                <li>Gerar métricas e relatórios de desempenho por estágio e por campanha.</li>
                <li>Prestar suporte, garantir a segurança e cumprir obrigações legais.</li>
              </ul>
            </PolicySection>

            <PolicySection id="compartilhamento" title="4. Compartilhamento com terceiros">
              <p>
                Não vendemos dados pessoais. Compartilhamos dados apenas na medida necessária
                para operar a plataforma, com destaque para:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="font-medium text-foreground">Meta / WhatsApp</span> — para
                  o envio de mensagens por meio da API oficial do WhatsApp (WhatsApp Business
                  Platform), os dados necessários ao envio são tratados pela Meta na condição
                  de operadora/destinatária. O tratamento pela Meta observa os termos e as
                  políticas de privacidade próprios da plataforma.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Provedores de infraestrutura
                  </span>{" "}
                  (hospedagem e serviços correlatos) estritamente para viabilizar o
                  funcionamento da plataforma.
                </li>
                <li>
                  <span className="font-medium text-foreground">Autoridades</span>, quando
                  exigido por lei ou por ordem judicial.
                </li>
              </ul>
            </PolicySection>

            <PolicySection id="retencao" title="5. Retenção dos dados">
              <p>
                Mantemos os dados pessoais apenas pelo tempo necessário para cumprir as
                finalidades descritas nesta Política, enquanto perdurar a relação com a
                clínica usuária e pelos prazos exigidos por obrigações legais ou
                regulatórias. Encerradas as finalidades e os prazos aplicáveis, os dados são
                eliminados ou anonimizados de forma segura.
              </p>
            </PolicySection>

            <PolicySection id="seus-direitos" title="6. Seus direitos (LGPD)">
              <p>
                Nos termos da LGPD, o titular dos dados pode, a qualquer momento, exercer os
                seguintes direitos:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <span className="font-medium text-foreground">Acesso</span> — confirmar a
                  existência de tratamento e acessar os seus dados.
                </li>
                <li>
                  <span className="font-medium text-foreground">Correção</span> — corrigir
                  dados incompletos, inexatos ou desatualizados.
                </li>
                <li>
                  <span className="font-medium text-foreground">Exclusão</span> — solicitar a
                  eliminação dos seus dados pessoais.
                </li>
                <li>
                  <span className="font-medium text-foreground">Portabilidade</span> —
                  solicitar a portabilidade dos dados a outro fornecedor.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Revogação do consentimento
                  </span>{" "}
                  — revogar, a qualquer tempo, o consentimento anteriormente concedido.
                </li>
              </ul>
            </PolicySection>

            <PolicySection id="exclusao-de-dados" title="7. Exclusão de dados">
              <p>
                Para solicitar a exclusão dos seus dados pessoais, siga os passos abaixo:
              </p>
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  Envie uma mensagem para{" "}
                  <a
                    href={`mailto:${dataDeletion.channel}`}
                    className="font-medium text-brand underline underline-offset-4 transition-colors hover:text-foreground"
                  >
                    {dataDeletion.channel}
                  </a>{" "}
                  com o assunto &ldquo;Exclusão de dados&rdquo;.
                </li>
                <li>
                  Informe o nome completo e o número de telefone/WhatsApp associado aos dados,
                  para que possamos localizá-los.
                </li>
                <li>
                  Confirmaremos o recebimento e concluiremos a exclusão em{" "}
                  {dataDeletion.timeframe}, salvo quando a retenção for exigida por lei.
                </li>
              </ol>
            </PolicySection>

            <PolicySection id="controlador-e-contato" title="8. Controlador e contato">
              <p>
                O controlador dos dados é o {controller}. Para dúvidas sobre esta Política ou
                para exercer os seus direitos, entre em contato pelo e-mail{" "}
                <a
                  href={`mailto:${contactChannel}`}
                  className="font-medium text-brand underline underline-offset-4 transition-colors hover:text-foreground"
                >
                  {contactChannel}
                </a>
                .
              </p>
            </PolicySection>
          </div>
        </article>
      </main>

      <LandingFooter />
    </>
  );
}
