import { generateClient } from "aws-amplify/api";
import type { Schema } from '../../../amplify/data/resource'

export const useAmplifyClient = () => {
    const client = generateClient<Schema>()

    return client;
}