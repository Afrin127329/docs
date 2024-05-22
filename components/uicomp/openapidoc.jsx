import { useEffect, useState } from "react"
import { HTTPAPIDoc } from "@components/uicomp/httpapidoc"
import { openApiSpec } from "@components/components/lib/apispec"

export const OpenAPIDoc = ({ url, path, method, isOpen }) => {
  const [spec, setSpec] = useState(undefined)


  const fetchMock = () => {
    return new Promise((resolve, reject) => {
      // Mimicking a successful response
      const response = {
        ok: true,
        status: 200,
        json: () => Promise.resolve(openApiSpec),
      };

      resolve(response);
    });
  };

  useEffect(() => {
    if (!url || !path) {
      return
    }
    const run = async () => {
      const response = await fetchMock(url)
      const result = await response.json()
      if (!result) {
        return
      }

      let origin = "https://api.cal.com"
      if (result.schemes?.[0] && result.host) {
        origin = `${result.schemes?.[0]}://${result.host}`
      } else if (result.servers?.[0]) {
        origin = result.servers?.[0]?.url
      }

      let basePath = ""
      if (result?.basePath) {
        basePath = result.basePath
      }

      const baseUrl = `${origin.replace(/\/+$/gi, '')}${basePath}`

      const spec = result.paths?.[path]?.[method.toLowerCase()]

      if (!spec) {
        return
      }
      setSpec({
        baseUrl,
        description: spec?.summary || spec?.description,
        parameters: spec?.parameters,
        responses: spec?.responses || {},
        requestBody: spec?.requestBody || {},
      })
    }
    run()
  }, [url, path])

  return <HTTPAPIDoc
    method={method}
    baseUrl={spec?.baseUrl}
    path={path}
    description={spec?.description}
    parameters={spec?.parameters}
    responses={spec?.responses}
    requestBody={spec?.requestBody}
    isOpen={isOpen} />
}

<OpenAPIDoc
  url="https://api.cal.com/docs"
  method="POST"
  path="/webhooks"
  isOpen
/>
