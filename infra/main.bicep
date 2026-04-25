// MMX Alpha infrastructure — Log Analytics + Container Apps Environment
// Subscription: castle (fba948d9-...) | RG: rg-mmx-alpha | Region: eastus
// Container images live in GitHub Container Registry (ghcr.io) to keep Alpha at zero cost.

@description('Azure region for all resources')
param location string = resourceGroup().location

@description('Project identifier (used in resource names)')
param project string = 'mmx'

@description('Environment short name (alpha, dev, prod)')
@allowed([
  'alpha'
  'dev'
  'prod'
])
param environment string = 'alpha'

@description('Runtime value for MMX_APP_ENV env var (must match validate-env.mjs whitelist)')
@allowed([
  'development'
  'staging'
  'production'
])
param appEnv string = 'production'

@description('Comma-separated list of allowed origins in production')
param corsOriginsProd string = 'https://mmx-platform.vercel.app'

@description('Port the container listens on (must match app and Dockerfile EXPOSE)')
param targetPort int = 4000

@description('Full image reference in GitHub Container Registry')
param imageReference string = 'ghcr.io/paulilio/mmx-api:alpha-v1'

@description('GitHub username used to authenticate against ghcr.io')
param ghcrUsername string = 'paulilio'

@description('GitHub Personal Access Token with read:packages scope (passed at deploy-time)')
@secure()
param ghcrPassword string

@description('Neon pooled connection string (runtime)')
@secure()
param databaseUrl string

@description('Neon direct connection string (migrations)')
@secure()
param directUrl string

@description('JWT access token signing secret')
@secure()
param jwtAccessSecret string

@description('JWT refresh token signing secret')
@secure()
param jwtRefreshSecret string

@description('Google OAuth client ID (vazio desabilita Google login)')
param googleClientId string = ''

@description('Google OAuth client secret')
@secure()
param googleClientSecret string = ''

@description('Google OAuth redirect URI (vazio = backend deriva do host)')
param googleRedirectUri string = ''

@description('Microsoft OAuth client ID (vazio desabilita Microsoft login)')
param microsoftClientId string = ''

@description('Microsoft OAuth client secret')
@secure()
param microsoftClientSecret string = ''

@description('Microsoft OAuth redirect URI (vazio = backend deriva do host)')
param microsoftRedirectUri string = ''

@description('Microsoft OAuth tenant (common = personal + work)')
param microsoftTenantId string = 'common'

// Derived names — kebab-case
var lawName = 'law-${project}-${environment}'
var caeName = 'cae-${project}-${environment}'
var caName = 'ca-${project}-api-${environment}'

// Tags inherited by every resource
var commonTags = {
  project: project
  environment: environment
  ecosystem: 'castle'
}

// Log Analytics workspace — destination for ACA logs and metrics
resource law 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: lawName
  location: location
  tags: commonTags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// Container Apps managed environment — host for Container Apps in this RG
resource cae 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: caeName
  location: location
  tags: commonTags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: law.properties.customerId
        sharedKey: law.listKeys().primarySharedKey
      }
    }
  }
}

// Container App — MMX API
// Scale-to-zero in Alpha keeps free-grant usage low; cold start ~5-10s on first hit.
resource app 'Microsoft.App/containerApps@2024-03-01' = {
  name: caName
  location: location
  tags: commonTags
  properties: {
    managedEnvironmentId: cae.id
    configuration: {
      ingress: {
        external: true
        targetPort: targetPort
        transport: 'auto'
        allowInsecure: false
      }
      registries: [
        {
          server: 'ghcr.io'
          username: ghcrUsername
          passwordSecretRef: 'ghcr-pat'
        }
      ]
      secrets: [
        { name: 'ghcr-pat', value: ghcrPassword }
        { name: 'database-url', value: databaseUrl }
        { name: 'direct-url', value: directUrl }
        { name: 'jwt-access-secret', value: jwtAccessSecret }
        { name: 'jwt-refresh-secret', value: jwtRefreshSecret }
        { name: 'google-client-secret', value: empty(googleClientSecret) ? 'placeholder' : googleClientSecret }
        { name: 'microsoft-client-secret', value: empty(microsoftClientSecret) ? 'placeholder' : microsoftClientSecret }
      ]
    }
    template: {
      containers: [
        {
          name: 'mmx-api'
          image: imageReference
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            { name: 'PORT', value: string(targetPort) }
            { name: 'MMX_APP_ENV', value: appEnv }
            { name: 'CORS_ORIGINS_PROD', value: corsOriginsProd }
            { name: 'DATABASE_URL', secretRef: 'database-url' }
            { name: 'DIRECT_URL', secretRef: 'direct-url' }
            { name: 'JWT_ACCESS_SECRET', secretRef: 'jwt-access-secret' }
            { name: 'JWT_REFRESH_SECRET', secretRef: 'jwt-refresh-secret' }
            { name: 'GOOGLE_CLIENT_ID', value: googleClientId }
            { name: 'GOOGLE_CLIENT_SECRET', secretRef: 'google-client-secret' }
            { name: 'GOOGLE_REDIRECT_URI', value: googleRedirectUri }
            { name: 'MICROSOFT_CLIENT_ID', value: microsoftClientId }
            { name: 'MICROSOFT_CLIENT_SECRET', secretRef: 'microsoft-client-secret' }
            { name: 'MICROSOFT_REDIRECT_URI', value: microsoftRedirectUri }
            { name: 'MICROSOFT_TENANT_ID', value: microsoftTenantId }
          ]
          probes: [
            {
              type: 'Startup'
              httpGet: { path: '/health', port: targetPort }
              initialDelaySeconds: 5
              periodSeconds: 5
              failureThreshold: 20
            }
            {
              type: 'Liveness'
              httpGet: { path: '/health', port: targetPort }
              initialDelaySeconds: 30
              periodSeconds: 30
            }
            {
              type: 'Readiness'
              httpGet: { path: '/health/ready', port: targetPort }
              initialDelaySeconds: 10
              periodSeconds: 15
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
      }
    }
  }
}

// Outputs — URLs and IDs useful for next phases
output logAnalyticsWorkspaceId string = law.id
output containerAppsEnvironmentId string = cae.id
output containerAppName string = app.name
output containerAppUrl string = 'https://${app.properties.configuration.ingress.fqdn}'
