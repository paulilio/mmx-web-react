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

// Derived names — kebab-case
var lawName = 'law-${project}-${environment}'
var caeName = 'cae-${project}-${environment}'

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

// Outputs — consumed by Container App deployment in F2
output logAnalyticsWorkspaceId string = law.id
output containerAppsEnvironmentId string = cae.id
