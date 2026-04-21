"use client"

import { useFieldArray, useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Trash, Plus } from "lucide-react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

export function VariationForm() {
    const { control } = useFormContext()
    const { fields: variations, append: appendVariation, remove: removeVariation } = useFieldArray({
        control,
        name: "variations",
    })

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Variações e Adicionais</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendVariation({ name: "", required: false, multiSelect: false, options: [{ name: "", price: 0 }] })}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Variação
                </Button>
            </div>

            {variations.map((variation, index) => (
                <div key={variation.id} className="border rounded-md p-4 space-y-4 bg-gray-50">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1 space-y-4">
                            <FormField
                                control={control}
                                name={`variations.${index}.name`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome da Variação (ex: Tamanho, Molho)</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Nome da variação" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-4">
                                <FormField
                                    control={control}
                                    name={`variations.${index}.required`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel className="!mt-0">Obrigatório</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name={`variations.${index}.multiSelect`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                            <FormControl>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel className="!mt-0">Múltipla Escolha</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => removeVariation(index)}
                        >
                            <Trash className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="pl-4 border-l-2 border-gray-200">
                        <VariationOptions nestIndex={index} />
                    </div>
                </div>
            ))}
        </div>
    )
}

function VariationOptions({ nestIndex }: { nestIndex: number }) {
    const { control } = useFormContext()
    const { fields: options, append: appendOption, remove: removeOption } = useFieldArray({
        control,
        name: `variations.${nestIndex}.options`,
    })

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label className="text-sm text-gray-500">Opções</Label>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => appendOption({ name: "", price: 0 })}
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Opção
                </Button>
            </div>

            {options.map((option, k) => (
                <div key={option.id} className="flex gap-2 items-end">
                    <FormField
                        control={control}
                        name={`variations.${nestIndex}.options.${k}.name`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Input {...field} placeholder="Nome da opção" className="h-8" />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`variations.${nestIndex}.options.${k}.price`}
                        render={({ field }) => (
                            <FormItem className="w-24">
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(parseFloat(e.target.value))}
                                        placeholder="Preço"
                                        className="h-8"
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500"
                        onClick={() => removeOption(k)}
                    >
                        <Trash className="w-3 h-3" />
                    </Button>
                </div>
            ))}
        </div>
    )
}
