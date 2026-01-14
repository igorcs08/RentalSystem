# Projeto IA - Melhoria de Cadastro de Cliente (Endereço)

Para facilitar a localização de clientes em caso de atraso na devolução de fitas VHS, o cadastro de clientes será expandido para incluir informações detalhadas de endereço.

## Definição de Campos (Entidade Customer)

Os seguintes campos serão adicionados ao modelo de cliente:

- **CEP (ZipCode)**: String, obrigatório (Máscara: 00000-000).
- **Logradouro (Street)**: String, obrigatório (Rua, Avenida, etc).
- **Número (Number)**: String, obrigatório.
- **Complemento (Complement)**: String, opcional (Apto, Bloco, etc).
- **Bairro (Neighborhood)**: String, obrigatório.
- **Cidade (City)**: String, obrigatório.
- **Estado (State)**: String, obrigatório (UF com 2 caracteres).

## Impactos da Implementação

### Backend
- **Migrations**: Criar nova migration para adicionar os campos na tabela `Customers`.
- **DTOs**: Atualizar `CustomerDTO`, `CreateCustomerDto` e `UpdateCustomerDto`.
- **Mappings**: Atualizar o AutoMapper (se utilizado) para incluir os novos campos.

### Frontend
- **Serviços**: Atualizar as interfaces `Customer` e `CreateCustomer` no `customer.service.ts`.
- **Componentes**: 
  - Atualizar o modal de cadastro em `customer-list.ts` para incluir os novos campos.
  - Implementar integração com API de CEP (Ex: ViaCEP) para preenchimento automático.
  - Adicionar validações de formulário para os novos campos obrigatórios.

## Próximos Passos
1. Implementar as alterações no Backend (Model -> Migration -> DTO).
2. Atualizar o Frontend (Service -> Template -> Component Logic).
3. Testar o fluxo completo de cadastro e exibição.
